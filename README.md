# ethers-monitor

Monitor events for all contracts.

Add `ERC20.json` to contracts folder


```json
{
	"address": "",
	"abi": [],
	"startBlock": "9000000",
	"provider": "http://rpcURL.com"
}
```

`provider` is optional. Takes default from `.env`
`startBlock` is optional. Takes default 0. Recommeded to use contract deployment block number.
