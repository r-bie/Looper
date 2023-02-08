const chalk = require("chalk");
const Sales = require('../../schemas/sales');
const Web3 = require('web3');
const bazaarABI = require('../../abis/bazaar.json');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(chalk.green(`${client.user.tag} is online!`));

        let currblockbnb, currblockoec, currblockskale;

        var contractAddress = {
            bnb: {
                bazaar: '0x90099dA42806b21128A094C713347C7885aF79e2'
            },
            oec: {
                bazaar: '0x5ea2373e281E92FE3c53dc36cE855D89BF25F6F8'
            },
            skale: {
                bazaar: '0x570e6797DAFC13D40b8153078072D8a9c7E82eD8'
            }
        }

        var nodes = {
            bnb: 'https://rpc.ankr.com/bsc',
            oec: 'https://exchainrpc.okex.org',
            skale: 'https://kozak-blockdaemon-node-1.skale.bdnodes.net:10200/'
        }

        //fetching latest blocks in mongodb
        console.log(chalk.cyan('Fetching genesis blocks...'));

        try {
            query = await Sales.findOne({
                blockchain: 'bnb',
            }).sort({ blockNumber: -1 });

            currblockbnb = query.blockNumber;
        } catch (error) {
            console.error(error);
        }

        try {
            query = await Sales.findOne({
                blockchain: 'oec',
            }).sort({ blockNumber: -1 });

            currblockoec = query.blockNumber;
        } catch (error) {
            console.error(error);
        }

        try {
            query = await Sales.findOne({
                blockchain: 'skale',
            }).sort({ blockNumber: -1 });

            currblockskale = query.blockNumber;
        } catch (error) {
            console.error(error);
        }

        //latest blocks per chain
        console.log(chalk.green(`Genesis Blocks: ${currblockbnb} ${currblockoec} ${currblockskale}`));

        setInterval(initializeLoop, 30000);

        async function initializeLoop() {
            try {
                var [bnbFirst, bnbLast] = await getLastBlock(currblockbnb, 'bnb');
                var [oecFirst, oecLast] = await getLastBlock(currblockoec, 'oec');
                var [skaleFirst, skaleLast] = await getLastBlock(currblockskale, 'skale');
                console.log(`[logdata][bnb]First block: ${bnbFirst} | Next block: ${bnbLast}`);
                currblockbnb = bnbLast;
                console.log(`[logdata][oec]First block: ${oecFirst} | Next block: ${oecLast}`);
                currblockoec = oecLast;
                console.log(`[logdata][skale]First block: ${skaleFirst} | Next block: ${skaleLast}`);
                currblockskale = skaleLast;
                console.log(`[logdata][LastBlocks]BNB / OEC / SKALE: ${bnbLast} ${oecLast} ${skaleLast}`);
            } catch (error) {
                console.log(error);
            }
        }

        async function getLastBlock(block, chain) {
            // declaring web3 environment
            const web3 = new Web3(new Web3.providers.HttpProvider(nodes[chain]));
            const contract = new web3.eth.Contract(bazaarABI, contractAddress[chain].bazaar);

            // declare latest block to avoid overflow
            var getLatestBlock = async () => web3.eth.getBlock('latest');
            var latestBlock = await getLatestBlock();

            // overflow 
            if (block > latestBlock.number) {
                console.log(`[logdata][${chalk.green(chain)}]${chalk.red("Overflow")}.. returning latest block ${chalk.green(latestBlock.number)}`);
                return [latestBlock.number, latestBlock.number];
            }

            last = Number(block) + Number(1999);
            var response = await contract.getPastEvents({ fromBlock: block, toBlock: last });
            newArray = response;
            x = response.length;
            y = x - 1;

            switch (x) {
                case 0:
                    difference = Number(latestBlock.number) - Number(block);
                    console.log(`[logdata][${chalk.green(chain)}]No past events between blocks ${chalk.green(block)} to ${chalk.green(last)}  |  Latest Block: ${chalk.green(latestBlock.number)} Difference: ${chalk.green(difference)}`);

                    if (difference > 2000) {
                        nextBlock = Number(block) + 1999;
                    } else {
                        nextBlock = Number(block) + 1;
                    }

                    return [block, nextBlock];
                case 1:
                    console.log(`[logdata][${chalk.green(chain)}]Sent to discord ${chalk.green(chain)} | ${chalk.green(newArray[0].blockNumber)}`);

                    client.channels.fetch('1018242383625863188')
                        .then(channel => {
                            channel.send(`${chain} ${newArray[0].blockNumber}`);
                        });

                    nextBlock = Number(newArray[0].blockNumber) + 1;
                    return [block, nextBlock];
                default:
                    console.log(`[logdata][${chalk.green(chain)}]Sent to discord ${chalk.green(chain)} | ${chalk.green(newArray[0].blockNumber)}`);

                    client.channels.fetch('1018242383625863188')
                        .then(channel => {
                            channel.send(`${chain} ${newArray[0].blockNumber}`);
                        });

                    nextBlock = Number(newArray[y].blockNumber) + 1
                    return [block, nextBlock];
            }
        }
    }
}