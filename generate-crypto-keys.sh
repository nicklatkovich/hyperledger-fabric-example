set -e

# export FABRIC_CFG_PATH=${PWD}
CHANNEL_NAME=mychannel

rm -rf ./config/* && mkdir -p ./config
rm -rf ./crypto-config

cryptogen generate --config=./crypto-config.yaml
if [ "$?" -ne 0 ]; then
	echo "Failed to generate crypto material..."
	exit 1
fi

configtxgen -profile OneOrgOrdererGenesis -outputBlock ./config/genesis.block
if [ "$?" -ne 0 ]; then
	echo "Failed to generate orderer genesis block..."
	exit 1
fi

configtxgen -profile OneOrgChannel -outputCreateChannelTx ./config/channel.tx -channelID $CHANNEL_NAME
if [ "$?" -ne 0 ]; then
	echo "Failed to generate channel configuration transaction..."
	exit 1
fi

configtxgen \
	-profile OneOrgChannel \
	-outputAnchorPeersUpdate ./config/Org1MSPanchors.tx \
	-channelID $CHANNEL_NAME \
	-asOrg Org1MSP

if [ "$?" -ne 0 ]; then
	echo "Failed to generate anchor peer update for Org1MSP..."
	exit 1
fi
