import { INodeType, INodeTypeDescription, INodeExecutionData } from 'n8n-workflow';
import { IExecuteFunctions } from 'n8n-workflow';
import { exec } from 'child_process';
import * as util from 'util';

const execPromise = util.promisify(exec);

export class gen_code implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Gen Code Auto',
        name: 'genCodeAuto',
        group: ['transform'],
        version: 1,
        description: 'Generate code based on natural language input using an AI model',
        defaults: {
            name: 'Gen Code Auto',
        },
        inputs: ['main' as any],
        outputs: ['main' as any],
        icon: 'file:nodes/gen_code_auto/gen_code.svg',
        properties: [
            {
                displayName: 'Natural Language Input',
                name: 'textInput',
                type: 'string',
                default: '',
                placeholder: 'Describe what the code should do...',
                description: 'Enter the description of the code you want to generate.',
            },
            {
                displayName: 'Programming Language',
                name: 'language',
                type: 'options',
                options: [
                    { name: 'JavaScript', value: 'javascript' },
                    { name: 'Python', value: 'python' },
                ],
                default: 'javascript',
                description: 'Select the programming language for the generated code.',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData = [];

        for (let i = 0; i < items.length; i++) {
            const textInput = this.getNodeParameter('textInput', i) as string;
            const language = this.getNodeParameter('language', i) as string;

            try {
                // Gọi script Python với mô tả và ngôn ngữ
                const { stdout } = await execPromise(`python3 local_model_script.py "${textInput}" "${language}"`);
                
                // Lưu kết quả sinh mã từ model vào output
                returnData.push({
                    json: {
                        code: stdout,
                    },
                });
            } catch (error) {
                returnData.push({
                    json: {
                        error: `Error generating code: ${error.message}`,
                    },
                });
            }
        }

        return [returnData];
    }
}
