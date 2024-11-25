import { INodeType, INodeTypeDescription, INodeExecutionData } from 'n8n-workflow';
import { IExecuteFunctions } from 'n8n-core';
import PDFDocument from 'pdfkit';

export class PdfGeneration implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'PDF Generation',
        name: 'pdfGeneration',
        group: ['transform'],
        version: 1,
        description: 'Generates a PDF file from text or table data',
        defaults: {
            name: 'PDF Generation',
        },
        inputs: ['main'],
        outputs: ['main'],
        icon: 'file:pdf-icon.svg',
        properties: [
            {
                displayName: 'Content Type',
                name: 'contentType',
                type: 'options',
                options: [
                    { name: 'Text', value: 'text' },
                    { name: 'Table', value: 'table' },
                ],
                default: 'text',
                description: 'Select the type of content to include in the PDF',
            },
            {
                displayName: 'Content',
                name: 'content',
                type: 'string',
                default: '',
                placeholder: 'Enter the content to include in the PDF...',
                description: 'Text or table data to be converted into a PDF',
            },
            {
                displayName: 'Filename',
                name: 'filename',
                type: 'string',
                default: 'output.pdf',
                description: 'Name of the generated PDF file',
            },
            {
                displayName: 'Auto Download',
                name: 'autoDownload',
                type: 'boolean',
                default: false,
                description: 'Whether to automatically download the PDF after generation',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            const contentType = this.getNodeParameter('contentType', i) as string;
            const content = this.getNodeParameter('content', i) as string;
            const filename = this.getNodeParameter('filename', i) as string;
            const autoDownload = this.getNodeParameter('autoDownload', i) as boolean;

            const doc = new PDFDocument();
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                returnData.push({
                    json: {
                        filename,
                        pdf: pdfBuffer.toString('base64'), // Output PDF as base64
                    },
                    binary: {
                        data: {
                            mimeType: 'application/pdf',
                            data: pdfBuffer.toString('base64'),
                            fileName: filename,
                        },
                    },
                });
            });

            // Add content to the PDF based on content type
            if (contentType === 'text') {
                doc.text(content);
            } else if (contentType === 'table') {
                // Logic for handling table data goes here
                doc.text('Table content (custom logic required)');
            }

            doc.end();

            // Optional log for autoDownload (remove if unnecessary)
            if (autoDownload) {
                console.log("Auto download is enabled");
            }
        }

        return [returnData];
    }
}
