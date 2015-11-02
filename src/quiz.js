var PicSelectBoxSelected = React.createClass({
  render: function() {
    return (
      <div className="picAnswerBoxSelected">
        <img className="answerImage" src={this.props.data.someshit} />
        <div className="checkboxWrap">
          <span className="checkedbox"></span>
        </div>
      </div>
    );
  }
});

var PicSelectBox = React.createClass({
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
      <div className={cssClass} onClick={this.handleClick}>
        <img className="answerImage" src={this.props.data.someshit} />
        <div className="checkboxWrap">
          <span className="checkbox"></span>
        </div>
      </div>
    );
  }
});

var PicQuestion = React.createClass({
  render: function() {
    var title = this.props.data.question;
    var pics = this.props.data.answers.map(function(picData, i) {
      if (picData.selected == "yes") {
        return <PicSelectBoxSelected data={picData} key={i} />
      } else {
         return <PicSelectBox data={picData} onClick={this.props.onClick} key={i} />
      }
    }, this);
    return (
      <div className="picQuestion">
        <div className="questionTitle">
          <img className="questionTitleImage" src={title} />
        </div>
        {pics}
      </div>
    )
  }
});

var TweetButton = React.createClass({
  getTweet: function() {
    return encodeURIComponent("I'm the " + this.props.data);
  },

  getUrl: function() {
    return "https://twitter.com/intent/tweet?text=" + this.getTweet() +
      "&url=" + encodeURIComponent(document.URL)
  },
  render: function() {
    return (
      <a className="twitter-share"
        href={this.getUrl()} >
        <i className="fa fa-twitter-square fa-2x"></i>
      </a>
    )
  }
});

var FacebookButton = React.createClass({
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
      <i onClick={this.handleClick} className="fa fa-facebook-square fa-2x facebook-icon"></i>
    )
  }
});

var Result = React.createClass({
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
      <div className="resultWrapper" id="result">
        <div className="quizName">
          {this.props.data.title}
        </div>
        <div className="result">
          You Got: {this.props.data.outcome.output}
        </div>
        <div className="resultText">
          {this.props.data.outcome.rawData.complaint_details}
        </div>
        <div className="resultImageWrapper">
          <img className="resultImage" src={this.props.data.outcome.image} />
        </div>
        <TweetButton data={this.props.data.outcome.output} />
        <div className="details">
          <div className="reportDetail">
            Date: {this.props.data.outcome.rawData.date_started}
          </div>
          <div className="reportDetail">
            Division: {this.props.data.outcome.rawData.division}
          </div>
          <div className="reportDetail">
            Complaint Type: {this.props.data.outcome.rawData.complaint_type}
          </div>
          <div className="reportDetail">
            Location Type: {this.props.data.outcome.rawData.location_type}
          </div>
          <div className="reportDetail">
            Park Or Facility: {this.props.data.outcome.rawData.park_or_facility}
          </div>
          <div className="reportDetail">
            Borough: {this.props.data.outcome.rawData.site_borough}
          </div>
          <div className="reportDetail">
            Resolution: {this.props.data.outcome.rawData.resolution_description}
          </div>
        </div>
      </div>
    )
  }
});

var Quiz = React.createClass({
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
        <PicQuestion data={question} onClick={this.handleClick} key={i} />
      );
    }, this);
    var result;
    if (this.state.outcome != null) {
      resultData = {outcome: this.state.outcome, title: this.props.data.title}
      result = <Result data={resultData} />
    }

    var quizClass = "questionsWrapper";
    if (this.state.complete) { quizClass += " quizCompleted"; }

    return (
      <div className="quiz">
        <div className="titleWrapper">
          <div className="quizTitle">
            {this.props.data.title}
          </div>
          <div className="quizSubtitle">
            {this.props.data.subtitle}
          </div>
        </div>
        <div className={quizClass}>
          {questions}
        </div>
        {result}
      </div>
    )
  }
});

React.render(
  <Quiz data={quizData} />,
  document.getElementById('content')
);
