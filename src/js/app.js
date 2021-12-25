App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // MetaMask/metamask-extension#2393
      instance.electionEvent({}, {
        fromBlock: 'latest',
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        App.finalPage();
      });
      instance.votedEvent({}, {
        fromBlock: 'latest',
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
    var abt = $("#abt");
    var alt = $("#altheader");
    var finalPage = $("#final");
    var main = $("#main");
    main.show();
    finalPage.hide();

    loader.show();
    content.hide();
    abt.hide();
    alt.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load about page info
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.electionInfo();
    }).then(function(electionInfo) {
      var aboutInfo = $("#aboutInfo");
      aboutInfo.empty();
      aboutInfo.append(electionInfo);
      aboutInfo.show();
    });

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];
          var age = candidate[3];
          var pos = candidate[4];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + age + "</th><td>" + pos + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.electionInfo();
    }).then(function(electionInfo) {
      var aboutInfo = $("#aboutInfo");
      aboutInfo.empty();
      aboutInfo.append(electionInfo);
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  finalPage: function() {
    var main = $("#main");
    var abt = $("#abt");
    var alt = $("#altheader");
    var finalPage = $("#final");
    main.hide();
    finalPage.show();
    abt.hide();
    alt.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load about page info
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.electionInfo();
    }).then(function(electionInfo) {
      var aboutInfo = $("#aboutInfo");
      aboutInfo.empty();
      aboutInfo.append(electionInfo);
      aboutInfo.show();
    });

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var finalResults = $("#finalResults");
      finalResults.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];
          var age = candidate[3];
          var pos = candidate[4];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + age + "</th><td>" + pos + "</td><td>" + voteCount + "</td></tr>"
          finalResults.append(candidateTemplate);
        });
      }
      var results = $("#results");
      results.show();
      return electionInstance.electionInfo();
    }).then(function(electionInfo) {
      var aboutInfo = $("#aboutInfo");
      aboutInfo.empty();
      aboutInfo.append(electionInfo);
    });
  },

  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
