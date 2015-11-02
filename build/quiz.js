var PicSelectBoxSelected = React.createClass({displayName: "PicSelectBoxSelected",
  render: function() {
    return (
      React.createElement("div", {className: "picAnswerBoxSelected"}, 
        React.createElement("img", {className: "answerImage", src: this.props.data.someshit}), 
        React.createElement("div", {className: "checkboxWrap"}, 
          React.createElement("span", {className: "checkedbox"})
        )
      )
    );
  }
});

var PicSelectBox = React.createClass({displayName: "PicSelectBox",
  handleClick: function() {
    this.props.onClick(this.props.data.q, this.props.data.a);
  },
  render: function() {
    var cssClass = "picAnswerBox ";
    switch(this.props.data.selected) {
      case "no":
        cssClass += "notSelected";
        break;
    }
    return (
      React.createElement("div", {className: cssClass, onClick: this.handleClick}, 
        React.createElement("img", {className: "answerImage", src: this.props.data.someshit}), 
        React.createElement("div", {className: "checkboxWrap"}, 
          React.createElement("span", {className: "checkbox"})
        )
      )
    );
  }
});

var PicQuestion = React.createClass({displayName: "PicQuestion",
  render: function() {
    var title = this.props.data.question;
    var pics = this.props.data.answers.map(function(picData, i) {
      if (picData.selected == "yes") {
        return React.createElement(PicSelectBoxSelected, {data: picData, key: i})
      } else {
         return React.createElement(PicSelectBox, {data: picData, onClick: this.props.onClick, key: i})
      }
    }, this);
    return (
      React.createElement("div", {className: "picQuestion"}, 
        React.createElement("div", {className: "questionTitle"}, 
          React.createElement("img", {className: "questionTitleImage", src: title})
        ), 
        pics
      )
    )
  }
});

var TweetButton = React.createClass({displayName: "TweetButton",
  getTweet: function() {
    return encodeURIComponent("I'm the " + this.props.data);
  },

  getUrl: function() {
    return "https://twitter.com/intent/tweet?text=" + this.getTweet() +
      "&url=" + encodeURIComponent(document.URL)
  },
  render: function() {
    return (
      React.createElement("a", {className: "twitter-share", 
        href: this.getUrl()}, 
        React.createElement("i", {className: "fa fa-twitter-square fa-2x"})
      )
    )
  }
});

var FacebookButton = React.createClass({displayName: "FacebookButton",
  handleClick: function() {
    FB.ui({
        method: 'feed',
        link: "http://www.decapitator.club",
        name: "I'm the " + this.props.data.output +". Which New York City animal decapitator are you?",
        picture: "http://www.decapitator.club/" + this.props.data.image,
    }, function(response){});
  },

  render: function() {
    return (
      React.createElement("i", {onClick: this.handleClick, className: "fa fa-facebook-square fa-2x facebook-icon"})
    )
  }
});

var Result = React.createClass({displayName: "Result",
  scroll: function() {
    $('html, body').animate({scrollTop: $("#result").offset().top + 10 }, 'slow');
  },
  componentDidUpdate: function() {
    this.scroll();
  },
  componentDidMount: function() {
    this.scroll();
  },
  render: function() {
    return (
      React.createElement("div", {className: "resultWrapper", id: "result"}, 
        React.createElement("div", {className: "quizName"}, 
          this.props.data.title
        ), 
        React.createElement("div", {className: "result"}, 
          "You Got: ", this.props.data.outcome.output
        ), 
        React.createElement("div", {className: "resultText"}, 
          this.props.data.outcome.rawData.complaint_details
        ), 
        React.createElement("div", {className: "resultImageWrapper"}, 
          React.createElement("img", {className: "resultImage", src: this.props.data.outcome.image})
        ), 
        React.createElement(TweetButton, {data: this.props.data.outcome.output}), 
        React.createElement("div", {className: "details"}, 
          React.createElement("div", {className: "reportDetail"}, 
            "Date: ", this.props.data.outcome.rawData.date_started
          ), 
          React.createElement("div", {className: "reportDetail"}, 
            "Division: ", this.props.data.outcome.rawData.division
          ), 
          React.createElement("div", {className: "reportDetail"}, 
            "Complaint Type: ", this.props.data.outcome.rawData.complaint_type
          ), 
          React.createElement("div", {className: "reportDetail"}, 
            "Location Type: ", this.props.data.outcome.rawData.location_type
          ), 
          React.createElement("div", {className: "reportDetail"}, 
            "Park Or Facility: ", this.props.data.outcome.rawData.park_or_facility
          ), 
          React.createElement("div", {className: "reportDetail"}, 
            "Borough: ", this.props.data.outcome.rawData.site_borough
          ), 
          React.createElement("div", {className: "reportDetail"}, 
            "Resolution: ", this.props.data.outcome.rawData.resolution_description
          )
        )
      )
    )
  }
});

var Quiz = React.createClass({displayName: "Quiz",
  getInitialState: function() {
    var questions = this.props.data.questions.map(function(question, q) {
      question.completed = false;
      question.answers = question.answers.map(function(answer, a) {
        answer.selected = "nascent";
        answer.a = a
        answer.q = q
        return answer;
      });
      return question;
    }, this);
    return {questions: questions, outcome: null, completed: false};
  },

  setQuestionState: function(q,a) {
    this.state.questions[q].completed = true;
    this.state.questions[q].answerId = this.state.questions[q].answers[a].id;
    this.state.questions[q].answers.map(function(answer){
      answer.selected = "no";
    });
    this.state.questions[q].answers[a].selected = "yes";
    this.setState(this.state);
  },

  checkComplete: function() {
    completed = this.state.questions.every(function(q) {
      return q.completed
    });
    return completed;
  },

  getAnswers: function() {
    return this.state.questions.map(function(q){
      return q.answerId;
    });
  },

  matchingElements: function(a, b) {
    var shorter, longer, count = 0;
    if (a.length > b.length) {
      shorter = b;
      longer = a;
    } else {
      shorter = a;
      longer = b;
    }
    for(var i=0; i<shorter.length; i++) {
      if (shorter[i] == longer[i]){
        count++;
      }
    }
    return count;
  },

  getOutcome: function(answers) {
    var outcomes = this.props.data.outcomes
    var bestCount = 0;
    var result = outcomes[0];
    for (var i=0; i<outcomes.length; i++) {
      outcome = outcomes[i];
      match = this.matchingElements(outcome.solution, answers);
      if (match > bestCount) {
        bestCount = match;
        result = outcome;
      }
    }
    return result;
  },

  handleClick: function(q, a) {
    this.setQuestionState(q,a);
    if (this.checkComplete()){
      this.state.complete = true;
      var answers = this.getAnswers();
      this.state.outcome = this.getOutcome(answers);
    }
  },

  render: function() {
    var questions = this.state.questions.map(function(question, i) {
      return (
        React.createElement(PicQuestion, {data: question, onClick: this.handleClick, key: i})
      );
    }, this);
    var result;
    if (this.state.outcome != null) {
      resultData = {outcome: this.state.outcome, title: this.props.data.title}
      result = React.createElement(Result, {data: resultData})
    }

    var quizClass = "questionsWrapper";
    if (this.state.complete) { quizClass += " quizCompleted"; }

    return (
      React.createElement("div", {className: "quiz"}, 
        React.createElement("div", {className: "titleWrapper"}, 
          React.createElement("div", {className: "quizTitle"}, 
            this.props.data.title
          ), 
          React.createElement("div", {className: "quizSubtitle"}, 
            this.props.data.subtitle
          )
        ), 
        React.createElement("div", {className: quizClass}, 
          questions
        ), 
        result
      )
    )
  }
});

React.render(
  React.createElement(Quiz, {data: quizData}),
  document.getElementById('content')
);
