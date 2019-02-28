set -e

export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
CC_SRC_PATH=/opt/chaincode
echo Compiling TypeScript code into JavaScript ...

pushd ../chaincode
npm install
npm run build
echo Finished compiling TypeScript code into JavaScript
popd

rm -rf ./hfc-key-store

pushd ../basic-network
./start.sh
docker-compose -f ./docker-compose.yml up -d cli
MSP_PATH="CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/"
MSP_PATH="${MSP_PATH}org1.example.com/users/Admin@org1.example.com/msp"
docker exec \
	-e "CORE_PEER_LOCALMSPID=Org1MSP" \
	-e ${MSP_PATH} \
	cli peer chaincode install \
	-n employees \
	-v 1.0 \
	-p "$CC_SRC_PATH" \
	-l node
docker exec \
	-e "CORE_PEER_LOCALMSPID=Org1MSP" \
	-e ${MSP_PATH} \
	cli peer chaincode instantiate \
	-o orderer.example.com:7050 \
	-C mychannel \
	-n employees \
	-l node \
	-v 1.0 \
	-c '{"Args":[]}' \
	-P "OR ('Org1MSP.member','Org2MSP.member')"
sleep 10
docker exec \
	-e "CORE_PEER_LOCALMSPID=Org1MSP" \
	-e MSP_PATH \
	cli peer chaincode invoke \
	-o orderer.example.com:7050 \
	-C mychannel \
	-n employees \
	-c '{"function":"initLedger","Args":[]}'
popd
