# Hyperledger Fabric example

## Up the network

1. Generate new crypto keys:
```
cd ./network
./generate.sh
```
2. Create `.env` file:
```
cp ./.template.env ./.env
```
3. Replace `CA_PRIVATE_KEY_FILENAME` in `.env` by filename of generated crypto key of `ca.org1.example.com`:
To get this filename use:
```
ls -alF ./crypto-config/peerOrganizations/org1.example.com/ca/ | grep "[0-9a-f]*_sk"
```
4. Start fabric:
```
cd ../fabric
./startFabric.sh
```
5. Check, that ca-server is started succesful:
```
docker ps -a -f "name=ca.example.com"
```
Status should be `Up`

## Create wallets
1. Install fabric dependencies
```
npm i
```
2. Enroll admin
```
npx ts-node ./src/enrollAdmin.ts
```
3. Register `user1`
```
npx ts-node ./src/registerUser.ts
```

## Use the network
Use:
* `src/queryAllEmployees` to call chaincodes without changing state
* `src/createEmployee` to create, sign and broadcast transactions
