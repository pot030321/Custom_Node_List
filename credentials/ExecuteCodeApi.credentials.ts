import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ExecuteCodeApi implements ICredentialType {
	name = 'executeCodeApi';
	displayName = 'Execute Code API';
	documentationUrl = 'https://rapidapi.com/judge0-official/api/judge0-ce';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-RapidAPI-Key': '={{$credentials.apiKey}}'
			}
		},
	};
}
