import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import axios from 'axios'
import sha256 from 'js-sha256'
import crypto from 'crypto'
import Base58 from 'base-58'

Vue.use(BootstrapVue)

const app = new Vue({
	el: '#app',
	data: {
		type: 4,
		types: [
			{id: 3, name: 'Issue'},
			{id: 4, name: 'Transfer'},
			{id: 5, name: 'Reissue'},
			{id: 6, name: 'Burn'},
			{id: 8, name: 'Lease'},
			{id: 9, name: 'Cancel leasing'},
			{id: 11, name: 'Mass Transfer'},
			{id: 12, name: 'Data'},
			{id: 13, name: 'Set script'},
			{id: 14, name: 'Sponsorship'},
			{id: 15, name: 'Set Asset Script'},
			{id: 16, name: 'Invoke Script'},
		],
		input: 'fields',
		dataArray: [],
		alert: {
			dismissSecs: 5,
			dismissCountDown: 0,
			variant: 'info',
			message: ''
		},
		dataCurrent: {
			// issue
			3: {
				type: 3,
				data: {
					fee: {
						assetId: 'WAVES',
						tokens: '1.0'
					},
					name: '',
					description: '',
					quantity: 0,
					precision: 0,
					reissuable: false,
					script: '',
				}
			},
			// transfer
			4: {
				type: 4,
				data: {
					amount: {
						assetId: 'WAVES',
						tokens: ''
					},
					fee: {
						assetId: 'WAVES',
						tokens: '0.001'
					},
					recipient: ''
				}
			},
			// reissue
			5: {
				type: 5,
				data: {
					fee: {
						assetId: 'WAVES',
						tokens: ''
					},
					assetId: '',
					quantity: 0,
					reissuable: false
				}
			},
			// burn
			6: {
				type: 6,
				data: {
					fee: {
						assetId: 'WAVES',
						tokens: '0.001'
					},
					assetId: '',
					quantity: 0,
					reissuable: false
				}
			},
			// lease
			8: {
				type: 8,
				data: {
					fee: {
						assetId: 'WAVES',
						tokens: '0.001'
					},
					amount: 0,
					recipient: ''
				}
			},
			// cancel leasing
			9: {
				type: 9,
				data: {
					fee: {
						assetId: 'WAVES',
						tokens: '0.001'
					},
					leaseId: ''
				}
			},
			// mass transfer
			11: {
				type: 11,
				data: {
					totalAmount: {
						assetId: '',
						tokens: ''
					},
					fee: {
						assetId: 'WAVES',
						tokens: '0.001'
					},
					transfers: [
					{
						recipient: '',
						amount: '0'
					}
					]
				}
			},
			// data tx
			12: {
				type: 12,
				data: {
					fee: {
						assetId: 'WAVES',
						tokens: '0.005'
					},
					data: [
						{type: 'string', key: '', value: ''}
					]
				}
			},
			// set script
			13: {
				type: 13,
				data: {
					fee: {
						assetId: 'WAVES',
						tokens: '0.01'
					},
					script: ''
				}
			},
			// sponsorship
			14: {
				type: 14,
				data: {
					minSponsoredAssetFee: {
						assetId: '',
						tokens: ''
					},
					fee: {
						assetId: 'WAVES',
						tokens: ''
					}
				}
			},
			// set asset script
			15: {
				type: 15,
				data: {
					fee: {
						assetId: 'WAVES',
						tokens: '1.0'
					},
					assetId: '',
					script: ''
				}
			},
			// invoke script
			16: {
				type: 16,
				data: {
					fee: {
						assetId: 'WAVES',
						tokens: '0.005'
					},
					dApp: '',
					call: {
						args: [{ key: '', type: 'string', value: '' }],
						function: '',
					},
					payment: [{
						tokens: '0.001',
						assetId: 'WAVES',
					}]
					// senderPublicKey: '',
				}
			},
		}
	},
	methods: {
		signAll: function() {
			this.dataArray.forEach((item, i) => {
				if (item.run) this.signTx(i)
			})
		},
		pubAll: function() {
			this.dataArray.forEach((item, i) => {
				if (item.run) this.signAndPublishTx(i)
			})
		},
		addData: function(type) {
			let params = JSON.parse(JSON.stringify(this.dataCurrent[type]))
			this.dataArray.push({
				run: true,
				params: params,
				result: null
			})
		},
		changeData: function(index) {
			this.type = this.dataArray[index].params.type
			this.dataCurrent[this.type] = JSON.parse(JSON.stringify(this.dataArray[index].params))
			this.dataArray.splice(index, 1)
			return
		},
		checkKeeper: function() {
			return typeof window.WavesKeeper !== 'undefined'
		},
		signTx: async function(index) {
			let params = this.dataArray[index].params
			try {
				let res = await window.WavesKeeper.signTransaction(params)
				this.dataArray[index].result = res
				console.log(res)
			} catch (err) {
				this.showAlert(err.message, 'warning')
				console.log(err)
			}
		},
		signAndPublishTx: async function(index) {
			let params = this.dataArray[index].params
			try {
				let res = await window.WavesKeeper.signAndPublishTransaction(params)
				this.dataArray[index].result = res
				console.log(res)
			} catch (err) {
				this.showAlert(err.message, 'warning')
				console.log(err)
			}
		},
		setAlertCount: function (count) {
			this.alert.dismissCountDown = count
		},
		showAlert: function (message, variant) {
			this.alert.dismissCountDown = this.alert.dismissSecs
			this.alert.variant = variant
			this.alert.message = message
		},
	}
});
