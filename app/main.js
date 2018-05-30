App = {
  web3Provider: null,
  contracts: {},
  balance: 0,
  account: null,
  instance: null,
  machine1: null,
  machine2: null,
  machine3: null,
  started: 0,
  roll1: -1,
  roll2: -1,
  roll3: -1,
  rolled: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
      toastr.warning('You need MetaMask extension or Parity to use this app.');

    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('SlotMachine.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var SlotMachineArtifact = data;

      try {
         App.contracts.SlotMachine = TruffleContract(SlotMachineArtifact);

        // Set the provider for our contract.
        App.contracts.SlotMachine.setProvider(App.web3Provider);

        App.checkAccount();
        App.slotMachine();
      } catch(err) {
          console.log(err);
      }

    });

    return App.bindEvents();
  },

  bindEvents: function() {
     $(document).on('click', '#slotMachineButtonShuffle', App.startRoll);
     $(document).on('click', '#whitdraw', App.whitdraw);
  },

  whitdraw: function() {

       App.checkBalance();

      if(App.balance != 0) {
        instance.withdraw.sendTransaction({from: App.account, value: 0}).then(function(resp) {
            console.log(resp);

            setTimeout(App.checkBalance, 2000);
 
        })
        .catch(function(err) {
            console.log(err);
        });
      } else {
          toastr.error('You have no money to withdraw');
      }
  },

  checkAccount: function() {
    web3.eth.getAccounts(function(error, accounts) {
        App.account = accounts[0];

        App.contracts.SlotMachine.deployed().then(function(_instance) {
            instance = _instance;

             var event = instance.Rolled();

             event.watch(function(err, resp) {
                 if(resp.event === "Rolled") {

                     $("#slotMachineButtonStop").attr("disabled", false);
                     $("#slotMachineButtonStop").attr("title", "");
                     $("#header-msg").text("Luck favors the bold!");

                     App.roll1 = resp.args.rand1.valueOf();
                     App.roll2 = resp.args.rand2.valueOf();
                     App.roll3 = resp.args.rand3.valueOf();

                     App.rolled = true;

                     console.log(App.roll1, App.roll2, App.roll3);

                     toastr.success('Go ahead!', 'Press Stop to find out if you won');

                     setTimeout(App.checkBalance, 1000);
                 }
             });

            App.checkBalance();
        })
        .catch(function(err) {
            toastr.warning('Make sure you are connected to Ropsten network');
        });
    });
  },

   checkBalance: function() {

    instance.balanceOf.call(App.account).then(function(_balance) {

        App.balance = _balance.valueOf();

        var balanceInEther = web3.fromWei(App.balance, "ether");

        $("#balance").text(balanceInEther + " ether");
        
    });
   },
       

  startRoll: function() {
    event.preventDefault();

    if(App.started != 0) {
        return;
    }

    App.contracts.SlotMachine.deployed().then(function(instance) {

        return instance.oneRoll.sendTransaction({from: App.account, value: web3.toWei('0.1', 'ether')});

    }).then(function() {
        App.startShuffle();
    })
    .catch(function(err) {
        toastr.warning('Make sure you are connected to Ropsten network');
    });
  },

  prizeWon: function() {

    var msg = "";

    if(App.roll1 == 5 && App.roll2 == 5 && App.roll3 == 5) {
        msg = "Congratulation you won 3 ether!";
    } else if(App.roll1 == 6 && App.roll2 == 5 && App.roll3 == 6)  {
        msg = "Congratulation you won 2 ether!";
    } else if(App.roll1 == 4 && App.roll2 == 4 && App.roll3 == 4)  {
        msg = "Congratulation you won 1.5 ether!";
    } else if(App.roll1 == 3 && App.roll2 == 3 && App.roll3 == 3)  {
        msg = "Congratulation you won 1.2 ether!";
    } else if(App.roll1 == 2 && App.roll2 == 2 && App.roll3 == 2)  {
        msg = "Congratulation you won 1 ether!";
    } else if(App.roll1 == 1 && App.roll2 == 1 && App.roll3 == 1)  {
        msg = "Congratulation you won 0.5 ether";
    } else if((App.roll1 == App.roll2) || (App.roll1 == App.roll3) || (App.roll2 == App.roll3)) {
        msg = "Good job you get your 0.1 ether back!";
    } else {
        msg = "Better luck next time!";
    }

    $("#header-msg").text(msg);

    App.checkBalance();

    toastr.success(msg);

    $("#slotMachineButtonShuffle").attr("disabled", false);
  },

  startShuffle: function() {
    App.started = 3;
    App.machine1.shuffle();
    App.machine2.shuffle();
    App.machine3.shuffle();

    $("#slotMachineButtonShuffle").attr("disabled", true);
    $("#slotMachineButtonStop").attr("disabled", true);

    var pls = "Getting the result from ethereum...";

    $("#slotMachineButtonStop").attr("title", pls);

    $("#header-msg").text(pls);
  },

  slotMachine: function() {

      	App.machine1 = $("#casino1").slotMachine({
            active	: 0,
            delay	: 500
        });

        App.machine2 = $("#casino2").slotMachine({
            active	: 1,
            delay	: 500
        });

        App.machine3 = $("#casino3").slotMachine({
            active	: 2,
            delay	: 500
        });

        App.machine1.setRandomize(function() { return App.roll1 - 1; });
        App.machine2.setRandomize(function() { return App.roll2 - 1; });
        App.machine3.setRandomize(function() { return App.roll3 - 1; });

        App.started = 0;

        $("#slotMachineButtonStop").click(function(){

            //if we didn't get the result from the blockchain
            if(!App.rolled) {
                return;
            }

            switch(App.started){
                case 3:
                    App.machine1.stop();
                    break;
                case 2:
                    App.machine2.stop();
                    break;
                case 1:
                    App.machine3.stop();
                    App.prizeWon();

                    App.rolled = false; //reset the roll logic
                    break;
            }
            App.started--;
        });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
