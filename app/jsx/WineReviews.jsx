// REACT AND PLUGINS
var React = require('react/addons');
var classNames = require('classnames');

// WINE REVIEWS COMPONENT
// Overarching component, renders controller and reviews
var WineReviews = React.createClass({
  getInitialState: function() {
    return {
      data: false,
      loading: true
    }
  },
  updateData: function(newData, flush) {
    if(flush) {
      // Get new set
      this.setState({
        data: newData,
        loading: false
      });
    } else {
      // Add to existing set
      var oldData = this.state.data;
      var addedData = oldData.concat(newData);
      this.setState({
        data: addedData
      });
    }
  },
  render: function() {
    if(this.state.loading) {
      var loadingClass = 'loading';
    } else {
      var loadingClass = 'loading-done';
    }
    var appInner = classNames(
      'app-inner',
      'clearfix',
      loadingClass
    );
    return (
      <div className={appInner}>
        <Controller updateData={this.updateData} />
        <Reviews data={this.state.data} />
      </div>
    );
  }
});

// CONTROLLER COMPONENT
// Handles sorting, filtering and searching. Requests data from API. Renders header.
var Controller = React.createClass({
  getInitialState: function() {
    // Define the default query
    return {
      query: {
        page: 1,
        limit: 24,
        sortBy: 'score',
        order: 'desc'
      },
      showSortMenu: false,
      showInfo: false
    }
  },
  getReviews: function(query) {
    var jsonURL = 'http://a.bt.no/widgets/wines/list';
    if(!query) {
      var oldQuery = this.state.query;
      var query = {
        page: oldQuery.page+1,
        limit: oldQuery.limit,
        sortBy: oldQuery.sortBy,
        order: oldQuery.order
      }
      var flush = false; // We don't want to replace the data      
    } else {
      var flush = true;
    }
    this.setState({
      query: query
    });
    $.ajax({
      url: jsonURL,
      data: query,
      dataType: 'json',
      success: function(data) {
        this.props.updateData(data, flush);      
      }.bind(this),
      error: function(xhr, status, err) {
        console.log('Noe gikk galt. Fikk ikke hentet data.');
      }
    });
  },
  componentDidMount: function() {
    this.getReviews(this.state.query);
  },
  toggle: function(arg) {
    if(arg == 'overlay') {
      this.setState({
        showSortMenu: false,
        showInfo: false
      });
    } else {
      if(arg == 'sort') {
        var active = this.state.showSortMenu;
        if(active) {
          var showHide = false;
        } else {
          var showHide = true;
        }
        this.setState({
          showSortMenu: showHide
        });
      } else {
        var active = this.state.showInfo;
        if(active) {
          var showHide = false;
        } else {
          var showHide = true;
        }
        this.setState({
          showInfo: showHide
        });
      }
    }
  },
  sortItems: function(sortBy) {
    var oldQuery = this.state.query;
    
    if(oldQuery.sortBy == sortBy) {
      // If we click the already active button, we change the order parameter instead of sortBy
      if(oldQuery.order == 'asc') {
        var newOrder = 'desc';
      } else {
        var newOrder = 'asc';
      }
      var query = {
        page: 1,
        limit: oldQuery.limit,
        sortBy: oldQuery.sortBy,
        order: newOrder
      }
    } else {
      var query = {
        page: 1,
        limit: oldQuery.limit,
        sortBy: sortBy,
        order: oldQuery.order
      }
    }
    this.setState({
      query: query
    });
    this.getReviews(query);
  },
  loadMore: function() {
    this.getReviews(false);
  },
  render: function() {
    var infoboxVisibility = 'hidden';
    if(this.state.showInfo) {
      var infoboxVisibility = 'visible';
    }
    var overlayVisibility = 'hidden';
    if(this.state.showSortMenu || this.state.showInfo) {
      var overlayVisibility = 'visible';
    }
    return (
      <div id="controller">
        <header id="app-header" role="banner">
          <div className="header-inner clearfix">
            <div id="sort" className="header-area">
              <button className="toggle" aria-label="Aktiver sortering" onClick={this.toggle.bind(this, 'sort')}>Sorter</button>
              <SortMenu order={this.state.query.order} sortBy={this.state.query.sortBy} sortItems={this.sortItems} visible={this.state.showSortMenu} />
            </div>
            <div id="bt-vin-logo">
              <span id="bt-logo" className="logo"></span>
              <h1 className="text page-title">Vin</h1>
            </div>
            <div id="info" className="header-area">
              <button className="toggle" aria-label="Aktiver informasjon" onClick={this.toggle.bind(this, 'info')}>Info</button>
                <div id="infobox" className={infoboxVisibility}>
                  <p className="description">BT Vin er en platform som viser vinanmeldelser publisert på BT.no</p>
                  
                  <div className="small">
                    <p>Et prosjekt av <a target="_blank" href="https://twitter.com/joekimt">Joakim Tønnesen</a></p>
                    <p>All data tilhører Bergens Tidende</p>
                    <p>Kildekode: <a target="_blank" href="https://github.com/joakimtonnesen/bt-vin">Github</a></p>
                  </div>
                </div>
            </div>
          </div>
        </header>
        <div id="load-more">
          <button className="vin" onClick={this.loadMore}>Last inn flere</button>
        </div>
      <div id="overlay" className={overlayVisibility} onClick={this.toggle.bind(this, 'overlay')}></div>
      </div>
    );
  }
});

// SORTMENU COMPONENT
// Menu for sorting reviews
var SortMenu = React.createClass({
  handleClick: function(arg) {
    this.props.sortItems(arg);
  },
  render: function() {
    var visibility = 'hidden';
    if(this.props.visible) {
      var visibility = 'visible';
    }
    var sortMenuClass = classNames(
      visibility,
      'sorting-by-' + this.props.sortBy,
      'ordering-by-' + this.props.order
    );
    return (
      <nav id="sort-menu" className={sortMenuClass}>
        <ul>
          <li><button className="sort-by-score" aria-label="Sorter etter poeng" onClick={this.handleClick.bind(this, 'score')}>Poeng</button></li>
          <li><button className="sort-by-price" aria-label="Sorter etter pris" onClick={this.handleClick.bind(this, 'price')}>Pris</button></li>
        </ul>
      </nav>
    );
  }
});

// REVIEWS COMPONENT
// Contains all the reviews and maps out data as props for the Review component
var Reviews = React.createClass({  
  mapReviews: function(data) {
    //var notSortable = []; // Array for the reviews that cannot be sorted
    this.reviews = data.map(function(review) {
      var display = true;
      
      var pictureUrl = review.pictureurl;
      var article = review.articles[0];
      var productnum = review.productnum;
      
      var imageUrl = false;
      if(pictureUrl) {
        var imageUrl = pictureUrl.split('{snd:mode}').join('BINARY').split('{snd:cropversion}').join('w180');
        if(imageUrl.toString().length < 10) {
          var imageUrl = false;
        }
      }
      var articleUrl = false;
      if(article) {
        var articleUrl = 'http://www.bt.no/article/bt' + article.id;
      }
      var productUrl = false
      if(productnum) {
        if(productnum.toString().length > 4) { // Check if this productnum is relevant for our external search
          var productUrl = 'http://www.vinmonopolet.no/vareutvalg/sok?query=' + productnum;
        }
      }
      
      // Hide items with no score/price and put into an array so we can display them later
      var score = review.score;
      if(score == null) {
        //notSortable.push(review);
        var display = false;
      }
      var price = review.price;
      if(price == null) {
        //notSortable.push(review);
        var display = false;
      }
      return(
        <Review
          display={display}
          name={review.name}
          description={review.description}
          score={score}
          price={price}
          wineYear={review.year}
          productUrl={productUrl}
          articleUrl={articleUrl}
          imageUrl={imageUrl}
          key={review.id} />
      )
    });
  },
  componentWillReceiveProps: function(nextProps) {
    if(nextProps.data) {
      this.mapReviews(nextProps.data);
    }
  },
  render: function() {
    return (
      <div id="reviews" className="reviews-inner clearfix" role="main">
        {this.reviews}
      </div>
    );
  }
});

// REVIEW COMPONENT
// Renders the review itself
var Review = React.createClass({
  render: function() {
    var imageUrl = this.props.imageUrl;
    var articleUrl = this.props.articleUrl;
    var productUrl = this.props.productUrl;
    var score = this.props.score;
    var imageWrapper = '';
    if(imageUrl) {
      var imageWrapper = (
        <div className="image-wrapper">
          <a target="_blank" href={imageUrl}><img src={imageUrl} alt={this.props.name} /></a>
        </div>
      );
    }
    var articleLink = '';
    var externalLinkAmount = '';
    if(articleUrl || productUrl) {
      if(articleUrl && productUrl) {
        var externalLinkAmount = 'two';
        var articleLink = (
          <span className="external-links two">
            <a target="_blank" href={articleUrl}>Les relatert artikkel</a>
            <a target="_blank" href={productUrl}>Sjekk tilgjengelighet</a>
          </span>
        );
      } else if(articleUrl) {
        var articleLink = (
          <span className="external-links">
            <a target="_blank" href={articleUrl}>Les relatert artikkel</a>
          </span>
        );
      } else if(productUrl) {
        var articleLink = (
          <span className="external-links">
            <a target="_blank" href={productUrl}>Sjekk tilgjengelighet</a>
          </span>
        );
      }
    }
    var displayClass = '';
    if(!this.props.display) {
      var displayClass = 'hidden';
    }
    var reviewClass = classNames(
      'review',
      externalLinkAmount,
      displayClass
    );
    var price = '';
    if(this.props.price) {
      var price = (
        <span className="price">NOK {this.props.price}</span>
      );
    }
    return (
      <article className={reviewClass}>
        <header>
          <h2 className="sr-only">{this.props.name}</h2>
          <Rating score={this.props.score} />
          {price}
          <blockquote cite={this.props.articleUrl}>
            <p>{this.props.description}</p>
          </blockquote>
        </header>
        <footer className="clearfix">
          {imageWrapper}
          <div className="name-wrapper hidden-sr">
            <h2>{this.props.name}</h2>
          </div>
          {articleLink}
        </footer>
      </article>
    );
  }
});

// RATING COMPONENT
// Renders the rating for reviews
var Rating = React.createClass({
  render: function() {
    var stars = [];
    for(var i = 0; i < this.props.score; i++) {
      stars.push(
        <span key={i} className="star"></span>
      );
    }
    var count = 6-stars.length;
    for(var i = 0; i < count; i++) {
      stars.push(
        <span key={'faded-'+i} className="star faded"></span>
      );
    }
    return (
      <div className="rating">
        <span className="sr-only">Anmelder gav denne vinen {this.props.rating}/6</span>
        {stars}
      </div>
    );
  }
});

var wrapper = document.getElementById('wine-review-app');
if(wrapper !== null) {
  React.render(<WineReviews />, wrapper);
}
