import React, { Component } from "react";
import Ouba from "../build/Ouba.json";
import Rewards from "../build/Rewards.json";
import Staking from "../build/Staking.json";
import "./App.css";
import { ethers } from "ethers";
import Main from "../components/Main";
import Navbar from "../components/Navbar";

class App extends Component {
  async componentDidMount() {
    await this.loadBlockchainData();
  }

  async loadBlockchainData() {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);
    // Account signer
    const signer = provider.getSigner();
    // add the signer address to state
    this.setState({ account: await signer.getAddress() });

    const OubaData = Ouba.networks[provider._network.chainId];
    if (OubaData) {
      const oubaContractConst = new ethers.Contract(
        OubaData.address,
        Ouba.abi,
        signer
      );
      this.setState({ oubaContract: oubaContractConst });
      let oubaBalance = ethers.utils.formatEther(
        await provider.getBalance(OubaData.address)
      );
      this.setState({ oubaBalance: oubaBalance.toString() });
    }

    const RewardsData = Rewards.networks[provider._network.chainId];
    if (RewardsData) {
      const rewardsContractConst = new ethers.Contract(
        RewardsData.address,
        Rewards.abi,
        signer
      );
      this.setState({ rewardsContract: rewardsContractConst });
      let rewardsBalance = ethers.utils.formatEther(
        await provider.getBalance(RewardsData.address)
      );
      this.setState({ rewardsBalance: rewardsBalance.toString() });
    }

    const StakingData = Staking.networks[provider._network.chainId];
    if (StakingData) {
      const stakingContractConst = new ethers.Contract(
        StakingData.address,
        Staking.abi,
        signer
      );
      this.setState({ stakingContract: stakingContractConst });
      let stakingBalance = ethers.utils.formatEther(
        await provider.getBalance(StakingData.address)
      );
      this.setState({ stakingBalance: stakingBalance.toString() });
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "0x0",
      oubaContract: {},
      rewardsContract: {},
      stakingContract: {},
      oubaBalance: "0",
      rewardsBalance: "0",
      stakingBalance: "0",
    };
  }

  stakeTokens = (amount) => {
    console.log(this.state);
    console.log(this.state.oubaContract);
    console.log(this.state.stakingContract.address);
    const decimals = 18;
    const input = amount.toString();
    const amountFinal = ethers.utils.parseUnits(input, decimals);

    this.state.oubaContract
      .approve(this.state.stakingContract.address, amountFinal)
      .then("TransactionHash", (hash) => {
        this.state.stakingContract.stakeTokens(amountFinal);
      });
    console.log("Amount spended to stake", amountFinal);
  };

  unstakeTokens = () => {
    this.state.stakingContract.unstakeToken();
  };

  render() {
    let content;
    content = (
      <Main
        oubaBalance={this.state.oubaBalance}
        rewardsBalance={this.state.rewardsBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeToken={this.unstakeTokens}
      />
    );
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "600px" }}
            >
              <div className="content mr-auto ml-auto">{content}</div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
