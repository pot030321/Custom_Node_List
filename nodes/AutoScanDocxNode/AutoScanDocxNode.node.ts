import { INodeType, INodeTypeDescription, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { IExecuteFunctions } from 'n8n-core';
import axios from 'axios';
import * as mammoth from 'mammoth';
import * as Tesseract from 'tesseract.js';

export class AutoScanDocxNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Auto Scan DOCX and Image',
        name: 'autoScanDocxNode',
        group: ['transform'],
        version: 1,
        description: 'Scan and classify document contents using OCR or DOCX extraction',
        defaults: {
            name: 'Auto Scan DOCX and Image',
        },
        inputs: ['main'],
        outputs: ['main'],
        icon: 'file:autoscan-icon.svg',
        properties: [
            {
                displayName: 'Input Type',
                name: 'inputType',
                type: 'options',
                options: [
                    { name: 'Image', value: 'image' },
                    { name: 'DOCX File', value: 'docx' },
                ],
                default: 'docx',
                description: 'Choose the input type for OCR scanning',
            },
            {
                displayName: 'File URL or Path',
                name: 'filePath',
                type: 'string',
                default: '',
                placeholder: 'Enter URL or local path to the document/image',
                description: 'The URL or file path for the document or image to be scanned',
            },
            {
                displayName: 'Language',
                name: 'language',
                type: 'options',
                options: [
                    { name: 'English', value: 'eng' },
                    { name: 'Vietnamese', value: 'vie' },
                ],
                default: 'eng',
                description: 'Language for OCR processing',
            },
            {
                displayName: 'Send Notification',
                name: 'sendNotification',
                type: 'boolean',
                default: false,
                description: 'Whether to send notification after processing',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            const inputType = this.getNodeParameter('inputType', i) as string;
            const filePath = this.getNodeParameter('filePath', i) as string;
            const language = this.getNodeParameter('language', i) as string;
            const sendNotification = this.getNodeParameter('sendNotification', i) as boolean;

            try {
                let extractedText: string | null = null;

                if (inputType === 'docx') {
                    // DOCX handling using mammoth
                    const result = await mammoth.extractRawText({ path: filePath });
                    extractedText = result.value;
                } else if (inputType === 'image') {
                    // Image OCR using Tesseract
                    const imageBuffer = await AutoScanDocxNode.fetchImageBuffer(filePath, this);
                    const { data: { text } } = await Tesseract.recognize(imageBuffer, language);
                    extractedText = text;
                } else {
                    throw new NodeOperationError(this.getNode(), 'Unsupported input type');
                }

                const classifiedData = AutoScanDocxNode.classifyDocument(extractedText);

                const outputData = {
                    extractedText,
                    classifiedData,
                    notification: sendNotification ? 'Notification sent' : 'No notification',
                };

                if (sendNotification) {
                    AutoScanDocxNode.sendNotification(outputData);
                }

                returnData.push({
                    json: outputData,
                });

            } catch (error) {
                throw new NodeOperationError(this.getNode(), `Error processing file: ${(error as Error).message}`);
            }
        }

        return [returnData];
    }

    static async fetchImageBuffer(filePath: string, context: IExecuteFunctions): Promise<Buffer> {
        if (filePath.startsWith('http')) {
            // Download image from URL
            const response = await axios.get(filePath, { responseType: 'arraybuffer' });
            return Buffer.from(response.data, 'binary');
        }
        throw new NodeOperationError(context.getNode(), 'Invalid input: URL must start with http/https');
    }

    static classifyDocument(text: string) {
        return {
            department: 'Finance',
            priority: 'High',
            summary: 'Extracted key information from document...',
        };
    }

    static sendNotification(data: any) {
        console.log('Notification sent with data:', data);
    }
}
