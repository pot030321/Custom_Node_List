import { INodeType, INodeTypeDescription, INodeExecutionData, NodeOperationError, IDataObject } from 'n8n-workflow';
import { IExecuteFunctions } from 'n8n-core';

export class ErrorCheckNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Error Check Node',
        name: 'errorCheckNode',
        group: ['control'],
        version: 1,
        description: 'Checks for errors in previous node and branches the workflow accordingly',
        defaults: {
            name: 'Error Check Node',
        },
        inputs: ['main'],
        outputs: ['main', 'error' as const], // Bạn có thể thay đổi lại ['main'] nếu chỉ muốn có một đầu ra duy nhất
        properties: [
            {
                displayName: 'Error Message Target',
                name: 'errorMessageTarget',
                type: 'options',
                options: [
                    { name: 'UI', value: 'ui' },
                    { name: 'Dev', value: 'dev' },
                    { name: 'Backend', value: 'backend' },
                ],
                default: 'ui',
                description: 'Specify where the error message should be sent or displayed',
            },
            {
                displayName: 'On Error',
                name: 'onError',
                type: 'options',
                options: [
                    { name: 'Stop Workflow', value: 'stop' },
                    { name: 'Continue Workflow', value: 'continue' },
                ],
                default: 'stop',
                description: 'Choose to stop or continue the workflow when an error is detected',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnDataSuccess: INodeExecutionData[] = [];
        const returnDataError: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            const errorMessageTarget = this.getNodeParameter('errorMessageTarget', i) as string;
            const onError = this.getNodeParameter('onError', i) as string;
            
            const item = items[i];
            const error = item.json.error || null;

            if (error) {
                // Process as error
                const errorInfo: IDataObject = {
                    message: `Error detected in node: ${this.getNode().name}`,
                    errorType: errorMessageTarget,
                    details: typeof error === 'object' && 'message' in error ? (error as IDataObject).message : error,
                };

                returnDataError.push({
                    json: errorInfo,
                });

                if (onError === 'stop') {
                    throw new NodeOperationError(this.getNode(), `Workflow stopped due to error: ${errorInfo.details}`);
                }
            } else {
                // Process as success
                returnDataSuccess.push(item);
            }
        }

        return [returnDataSuccess, returnDataError];
    }
}
