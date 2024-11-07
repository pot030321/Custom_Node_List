import {
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
	IExecuteFunctions,
} from 'n8n-workflow';
import { exec } from 'child_process';
import * as path from 'path';
import * as util from 'util';

const execPromise = util.promisify(exec);

export class CleanData implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Clean Data by RFE',
		name: 'cleanData',
		group: ['transform'],
		version: 1,
		description: 'Clean data using Recursive Feature Elimination (RFE)',
		defaults: {
			name: 'Clean Data by RFE',
		},
		inputs: '={{["main"]}}',
		outputs: '={{["main"]}}',
		properties: [
			{
				displayName: 'Target Column',
				name: 'targetColumn',
				type: 'string',
				default: 'target',
				description: 'The name of the target column for RFE',
			},
			{
				displayName: 'Number of Features to Keep',
				name: 'numFeatures',
				type: 'number',
				default: 5,
				description: 'Number of features to keep after applying RFE',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'JSON',
						value: 'json',
					},
					{
						name: 'Table',
						value: 'table',
					},
				],
				default: 'json',
				description: 'Choose the output format',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const targetColumn = this.getNodeParameter('targetColumn', 0) as string;
		const numFeatures = this.getNodeParameter('numFeatures', 0) as number;
		const outputFormat = this.getNodeParameter('outputFormat', 0) as string;

		const data = items[0].json; // Assuming the input data is JSON

		const returnData: INodeExecutionData[] = [];
		let outputData: INodeExecutionData[] = [];

		// Call Python script to perform RFE
		try {
			// Ensure correct path handling
			const pythonScriptPath = path.join(__dirname, '../../model/rfe_script.py');

			// Execute Python script with parameters
			const { stdout } = await execPromise(
				`python3 "${pythonScriptPath}" "${JSON.stringify(
					data,
				)}" "${targetColumn}" "${numFeatures}"`,
			);

			const cleanedData = JSON.parse(stdout);
			if (outputFormat === 'json') {
				outputData = [{ json: { cleanedData } }];
			} else {
				// Placeholder for converting JSON to table format
				// outputData = [{ json: { cleanedData: this.convertToTable(cleanedData) } }];
			}
		} catch (error) {
			returnData.push({
				json: {
					error: error.message || 'Error executing RFE script',
				},
			});
		}

		return outputData.length ? [outputData] : [returnData];
	}
}
