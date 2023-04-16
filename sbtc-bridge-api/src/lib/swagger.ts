export const swagger = {
	"components": {
		"examples": {},
		"headers": {},
		"parameters": {},
		"requestBodies": {},
		"responses": {},
		"schemas": {
			"IStringToStringDictionary": {
				"properties": {},
				"type": "object",
				"additionalProperties": {
					"type": "string"
				}
			},
			"FeeEstimateResponse": {
				"properties": {
					"feeInfo": {
						"properties": {
							"high_fee_per_kb": {
								"type": "number",
								"format": "double"
							},
							"medium_fee_per_kb": {
								"type": "number",
								"format": "double"
							},
							"low_fee_per_kb": {
								"type": "number",
								"format": "double"
							}
						},
						"required": [
							"high_fee_per_kb",
							"medium_fee_per_kb",
							"low_fee_per_kb"
						],
						"type": "object"
					}
				},
				"required": [
					"feeInfo"
				],
				"type": "object",
				"additionalProperties": false
			},
			"BalanceI": {
				"properties": {
					"balance": {
						"type": "number",
						"format": "double"
					}
				},
				"required": [
					"balance"
				],
				"type": "object",
				"additionalProperties": false
			},
			"SbtcContractDataI": {
				"properties": {
					"coordinator": {
						"properties": {
							"key": {
								"type": "string"
							},
							"addr": {
								"type": "string"
							}
						},
						"required": [
							"key",
							"addr"
						],
						"type": "object"
					},
					"sbtcWalletAddress": {
						"type": "string"
					},
					"numKeys": {
						"type": "number",
						"format": "double"
					},
					"numParties": {
						"type": "number",
						"format": "double"
					},
					"tradingHalted": {
						"type": "boolean"
					},
					"tokenUri": {
						"type": "string"
					},
					"threshold": {
						"type": "number",
						"format": "double"
					},
					"totalSupply": {
						"type": "number",
						"format": "double"
					},
					"decimals": {
						"type": "number",
						"format": "double"
					},
					"name": {
						"type": "string"
					}
				},
				"required": [
					"coordinator",
					"sbtcWalletAddress",
					"numKeys",
					"numParties",
					"tradingHalted",
					"tokenUri",
					"threshold",
					"totalSupply",
					"decimals",
					"name"
				],
				"type": "object",
				"additionalProperties": false
			}
		},
		"securitySchemes": {}
	},
	"info": {
		"title": "bridge-api",
		"version": "1.0.0",
		"description": "Enables caching of contract data for the sBTC Bridge app",
		"license": {
			"name": "ISC"
		},
		"contact": {}
	},
	"openapi": "3.0.0",
	"paths": {
		"/bridge-api/v1/config": {
			"get": {
				"operationId": "GetAllParam",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/IStringToStringDictionary"
								}
							}
						}
					}
				},
				"security": [],
				"parameters": []
			}
		},
		"/bridge-api/v1/config/{param}": {
			"get": {
				"operationId": "GetParam",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {
									"type": "string"
								}
							}
						}
					}
				},
				"security": [],
				"parameters": [
					{
						"in": "path",
						"name": "param",
						"required": true,
						"schema": {
							"type": "string"
						}
					}
				]
			}
		},
		"/bridge-api/v1/btc/tx/{txid}": {
			"get": {
				"operationId": "FetchRawTransaction",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {}
							}
						}
					}
				},
				"security": [],
				"parameters": [
					{
						"in": "path",
						"name": "txid",
						"required": true,
						"schema": {
							"type": "string"
						}
					}
				]
			}
		},
		"/bridge-api/v1/btc/wallet/address/{address}/utxos": {
			"get": {
				"operationId": "FetchUtxoSet",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {}
							}
						}
					}
				},
				"security": [],
				"parameters": [
					{
						"in": "path",
						"name": "address",
						"required": true,
						"schema": {
							"type": "string"
						}
					}
				]
			}
		},
		"/bridge-api/v1/btc/wallet/loadwallet/{name}": {
			"get": {
				"operationId": "LoadWallet",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {}
							}
						}
					}
				},
				"security": [],
				"parameters": [
					{
						"in": "path",
						"name": "name",
						"required": true,
						"schema": {
							"type": "string"
						}
					}
				]
			}
		},
		"/bridge-api/v1/btc/wallet/listwallets": {
			"get": {
				"operationId": "ListWallets",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {}
							}
						}
					}
				},
				"security": [],
				"parameters": []
			}
		},
		"/bridge-api/v1/btc/blocks/fee-estimate": {
			"get": {
				"operationId": "GetFeeEstimate",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/FeeEstimateResponse"
								}
							}
						}
					}
				},
				"security": [],
				"parameters": []
			}
		},
		"/bridge-api/v1/btc/blocks/info": {
			"get": {
				"operationId": "GetInfo",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {}
							}
						}
					}
				},
				"security": [],
				"parameters": []
			}
		},
		"/bridge-api/v1/btc/blocks/count": {
			"get": {
				"operationId": "GetCount",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {}
							}
						}
					}
				},
				"security": [],
				"parameters": []
			}
		},
		"/bridge-api/v1/sbtc/events": {
			"get": {
				"operationId": "FetchAllSbtcEvents",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {}
							}
						}
					}
				},
				"security": [],
				"parameters": []
			}
		},
		"/bridge-api/v1/sbtc/events/{page}": {
			"get": {
				"operationId": "FetchSbtcEvents",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {}
							}
						}
					}
				},
				"security": [],
				"parameters": [
					{
						"in": "path",
						"name": "page",
						"required": true,
						"schema": {
							"format": "double",
							"type": "number"
						}
					}
				]
			}
		},
		"/bridge-api/v1/sbtc/address/{address}/balance": {
			"get": {
				"operationId": "FetchUserSbtcBalance",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/BalanceI"
								}
							}
						}
					}
				},
				"security": [],
				"parameters": [
					{
						"in": "path",
						"name": "address",
						"required": true,
						"schema": {
							"type": "string"
						}
					}
				]
			}
		},
		"/bridge-api/v1/sbtc/data": {
			"get": {
				"operationId": "FetchSbtcContractData",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {
									"$ref": "#/components/schemas/SbtcContractDataI"
								}
							}
						}
					}
				},
				"security": [],
				"parameters": []
			}
		},
		"/bridge-api/v1/sbtc/wallet-address": {
			"get": {
				"operationId": "FetchSbtcWalletAddress",
				"responses": {
					"200": {
						"description": "Ok",
						"content": {
							"application/json": {
								"schema": {}
							}
						}
					}
				},
				"security": [],
				"parameters": []
			}
		}
	},
	"servers": [
		{
			"url": "/"
		}
	]
}