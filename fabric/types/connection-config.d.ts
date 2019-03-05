
export interface TimeoutConfig {
	peer: { endorser: string };
	orderer: string;
}

export interface ClientConfig {
	organization: string;
	connection: { timeout: TimeoutConfig };
}

export interface PeerConfig {}

export interface ChannelConfig {
	orderers: Array<string>;
	peers: { [peerUrl: string]: PeerConfig };
}

export interface OrganizationConfig {
	mspid: string;
	peers: Array<string>;
	certificateAuthorities: Array<string>;
}

export interface __gRPCConfig { url: string }

export interface CertificateAuthorityConfig {
	url: string;
	caName: string;
}

export default interface ConnectionConfig {
	name: string;
	version: string;
	client: ClientConfig;
	channels: { [channelName: string]: ChannelConfig };
	organizations: { [organicationName: string]: OrganizationConfig };
	orderers: { [ordererUrl: string]: __gRPCConfig };
	peers: { [peerUrl: string]: __gRPCConfig };
	certificateAuthorities: { [url: string]: CertificateAuthorityConfig };
}
