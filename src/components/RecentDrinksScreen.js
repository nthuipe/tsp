import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
    ListView, RefreshControl
} from 'react-native';
import InfiniteScrollView from 'react-native-infinite-scroll-view';

import PostItem from './PostItem';

import {connect} from 'react-redux';
import {listPosts, listMorePosts} from '../states/post-actions';
import {Container, Header, Left, Right, Button, Title, Icon, Body} from 'native-base';


class RecentDrinksScreen extends React.Component {
    static propTypes = {

        //searchText: PropTypes.string.isRequired,
        userId: PropTypes.string.isRequired,
        listingPosts: PropTypes.bool.isRequired,
        listingMorePosts: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        posts: PropTypes.array.isRequired,
        hasMorePosts: PropTypes.bool.isRequired,
        dispatch: PropTypes.func.isRequired,
        scrollProps: PropTypes.object,

    };

    constructor(props) {
        super(props);

        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2)
            })
        };

        this.handleRefresh = this.handleRefresh.bind(this);
        this.handleLoadMore = this.handleLoadMore.bind(this);
        this.handleGoBack = this.handleGoBack.bind(this);
    }

    componentDidMount() {
        this.props.dispatch(listPosts(this.props.userId));
    }

    componentWillReceiveProps(nextProps) {
        const {userId, dispatch, posts} = this.props;
        if (userId !== nextProps.userId) {
            dispatch(listPosts(nextProps.userId));
        }
        if (posts !== nextProps.posts) {
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(nextProps.posts)
            });
        }
    }

    renderItem(p) {
        return <PostItem {...p} />;
    }

    render() {
        const {listingPosts, hasMorePosts, posts, scrollProps} = this.props;
        console.log("In RecentDrink")
        console.log(this.props.posts);
        return (
            <Container>
                <Header>
                    <Left><Button transparent
                        onPress={this.handleGoBack}>
                        <Icon name='arrow-left' type='FontAwesome'  style={{fontSize: 24}} />
                    </Button></Left>
                    <Body><Title>New Post</Title></Body>
                    <Right></Right>
                </Header>
                <ListView
                    refreshControl={
                        <RefreshControl refreshing={listingPosts} onRefresh={this.handleRefresh} />
                    }
                    distanceToLoadMore={300}
                    renderScrollComponent={props => <InfiniteScrollView {...props} />}
                    dataSource={this.state.dataSource}
                    renderRow={(p) => {
                        return <PostItem {...p} />;
                    }}
                    canLoadMore={() => {
                        if (listingPosts || !posts.length)
                            return false;
                        return hasMorePosts;
                    }}
                    onLoadMoreAsync={this.handleLoadMore}
                    style={{backgroundColor: '#fff'}}
                    ref={(el) => this.listEl = el}
                    {...scrollProps}
                />
            </Container>
        );
    }

    handleGoBack() {
         this.props.navigation.goBack();

    }

    handleRefresh() {
        const {dispatch, userId} = this.props;
        console.log('#######################');
        console.log(userId);
        dispatch(listPosts(userId));
    }

    handleLoadMore() {
        const {listingMorePosts, dispatch, posts, userId} = this.props;
        const start = posts[posts.length - 1].id;
        if (listingMorePosts !== start)
            dispatch(listMorePosts(userId, start));
    }
}

export default connect((state, ownProps) => ({
    //searchText: state.search.searchText,
    listingPosts: state.post.listingPosts,
    listingMorePosts: state.post.listingMorePosts,
    posts: state.post.posts,
    hasMorePosts: state.post.hasMore,
    userId: state.userForm.name
}))(RecentDrinksScreen);
