import React, { Component } from "react";
import Web3 from "web3";
import Ouba from "../build/Ouba.json";
import Rewards from "../build/Rewards.json";
import Staking from "../build/Staking.json";
import "./App.css";
import { ethers } from "ethers";

class App extends Component {
  componentWillMount() {
    this.loadWeb3();
    this.loadBlockchainData();
  }

  async loadBlockchainData() {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);

    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    // const signer = provider.getSigner();
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();

    const OubaData = Ouba.network[networkId];
    if (OubaData) {
      const ouba = new web3.eth.Contract(Ouba.abi, OubaData.address);
      this.setState({ ouba });
      let oubaBalance = await ouba.methods.balance(this.state.account).call();
      this.setState({ oubaBalance: oubaBalance.toString() });
    }

    const RewardsData = Rewards.network[networkId];
    if (RewardsData) {
      const rewards = new web3.eth.Contract(Rewards.abi, RewardsData.address);
      this.setState({ rewards });
      let rewardsBalance = await rewards.methods
        .balance(this.state.account)
        .call();
      this.setState({ rewardsBalance: rewardsBalance.toString() });
    }

    const StakingData = Staking.network[networkId];
    if (StakingData) {
      const staking = new web3.eth.Contract(Staking.abi, StakingData.address);
      this.setState({ staking });
      let stakingBalance = await staking.methods
        .stakingBalance(this.state.account)
        .call();
      this.setState({ stakingBalance: stakingBalance.toString() });
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "0x0",
      ouba: {},
      rewards: {},
      oubaBalance: "0",
      rewardsBalance: "0",
      stakingBalance: "0",
      loading: true,
    };
  }

  //connect to metamask and reads it into the app using web3
  async loadWeb3() {
    if (window.etheruem) {
      window.web3 = new Web3(window.etheruem);
      await window.etheruem.enable();
      console.log(window.etheruem);
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      console.log(window.web3);
    } else {
      window.alert(
        "Non etheruem browser detected. You should consider trying to install metamask"
      );
    }
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true });
    this.state.ouba.methods
      .approve(this.state.staking.address, amount)
      .send({ from: this.state.account })
      .on("TransactionHash", (hash) => {
        this.state.staking.methods
          .stakeTokens(amount)
          .send({ from: this.state.account })
          .on("TransactionHash", (hash) => {
            this.setState({ loading: false });
          });
      });
  };

  unstakeTokens = (amount) => {
    this.setState({ loading: true });
    this.state.staking.methods
      .unstakeToken()
      .send({ from: this.state.account })
      .on("TransactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  render() {
    return (
      <div className="container">
        <h1>Hello, World!</h1>
        <p>Your account: {this.state.account}</p>
      </div>
    );
  }
}

export default App;
