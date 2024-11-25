import { INodeType, INodeTypeDescription, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { IExecuteFunctions } from 'n8n-core';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { MongoClient } from 'mongodb';

export class DbConnectNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Database Connector',
        name: 'dbConnectNode',
        group: ['transform'],
        version: 1,
        description: 'Connects to a database and retrieves table or collection names',
        defaults: {
            name: 'Database Connector',
        },
        inputs: ['main'],
        outputs: ['main'],
        icon: 'file:db-icon.svg',
        properties: [
            {
                displayName: 'Database Type',
                name: 'dbType',
                type: 'options',
                options: [
                    { name: 'MySQL', value: 'mysql' },
                    { name: 'MongoDB', value: 'mongodb' },
                ],
                default: 'mysql',
                description: 'Select the type of database to connect to',
            },
            {
                displayName: 'Host',
                name: 'host',
                type: 'string',
                default: '',
                placeholder: 'localhost or mongodb+srv://<username>:<password>@cluster-url',
                description: 'The host of the database',
            },
            {
                displayName: 'Port',
                name: 'port',
                type: 'number',
                default: 3306,
                description: 'The port to connect to the database (leave empty for MongoDB Atlas)',
            },
            {
                displayName: 'Username',
                name: 'username',
                type: 'string',
                default: '',
                description: 'The username for the database connection',
            },
            {
                displayName: 'Password',
                name: 'password',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                description: 'The password for the database connection',
            },
            {
                displayName: 'Database Name',
                name: 'database',
                type: 'string',
                default: '',
                description: 'The name of the database to connect to',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            const dbType = this.getNodeParameter('dbType', i) as string;
            const host = this.getNodeParameter('host', i) as string;
            const port = this.getNodeParameter('port', i) as number;
            const username = this.getNodeParameter('username', i) as string;
            const password = this.getNodeParameter('password', i) as string;
            const database = this.getNodeParameter('database', i) as string;

            try {
                if (dbType === 'mysql') {
                    // Connect and query MySQL
                    const connection = await mysql.createConnection({
                        host,
                        port,
                        user: username,
                        password,
                        database,
                    });

                    const [rows] = await connection.query<RowDataPacket[]>('SHOW TABLES');
                    await connection.end();

                    // Process returned data
                    rows.forEach((row: RowDataPacket) => {
                        const tableName = Object.values(row)[0] as string; // Extract table name
                        returnData.push({ json: { tableName } });
                    });
                } else if (dbType === 'mongodb') {
                    // Handle MongoDB URL format for Atlas
                    let url;
                    if (host.startsWith("mongodb+srv")) {
                        url = `${host}`;
                    } else {
                        url = `mongodb://${username}:${password}@${host}:${port}`;
                    }

                    const client = new MongoClient(url);
                    await client.connect();

                    const db = client.db(database);
                    const collections = await db.listCollections().toArray();
                    await client.close();

                    // Process returned data
                    collections.forEach((col) => {
                        returnData.push({ json: { collectionName: col.name } });
                    });
                } else {
                    throw new NodeOperationError(this.getNode(), 'Unsupported database type');
                }
            } catch (error) {
                // Use NodeOperationError for better error handling
                if (error instanceof Error) {
                    returnData.push({
                        json: { error: `Error connecting to database: ${error.message}` },
                    });
                } else {
                    throw new NodeOperationError(this.getNode(), 'An unknown error occurred');
                }
            }
        }

        return [returnData];
    }
}
