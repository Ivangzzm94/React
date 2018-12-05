import App, { Container } from "next/app";
import Page from '../components/Page';
import { ApolloProvider } from 'react-apollo';
import withData from '../lib/withData';

class MyApp extends App {
    static async getInitialProps({ Component, ctx }) {
        let pageProps = {};
        if(Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx);
        } //Every single page is going to crawl the entire page for any query or mutations that we have inside of that page that need to be fetched
        // This exposes the query to the user
        pageProps.query = ctx.query;
        return { pageProps };
    }
    render() {
        const  { Component, apollo, pageProps } = this.props;
        return (
            <Container>
                <ApolloProvider client={apollo}>
                    <Page>
                        <Component {...pageProps} />
                    </Page>
                </ApolloProvider>
            </Container>
        )
    }
}

export default withData(MyApp);
