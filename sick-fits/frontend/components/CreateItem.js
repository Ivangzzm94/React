import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Form from './styles/Form';
import gql from 'graphql-tag';
import formatMoney from '../lib/formatMoney';

const CREATE_ITEM_MUTATION = gql`
    mutation CREATE_ITEM_MUTATION (
        $title: String!
        $description: Stirng!
        $price: Int!
        $image: Stirng
        $largeImage: String
    ) {
        createItem(
            title: $title
            description: $description
            price: $price
            image: $image
            largeImage: $largeImage
            ) {
                id
            }
    }
`;

class CreateItem extends Component {
    state = {
        title: "DK Shoes",
        description: "Available in sizes 10, 11 ,12",
        image: "shoe.jpg",
        largeImage: "largeshoe.jpg",
        price: 1500,
    };
    // handleChange mirrors multiple inputs to your state
    handleChange = event => {
        const { name, type, value } = event.target;
        const val = type === 'number' ? parseFloat(value) : value;
        this.setState({ [name]: val}); // [name] is refering title, price , description, etc.
    };


    render() {
        return (
            <Mutation mutation={CREATE_ITEM_MUTATION} variables = {this.state}>
                {(createItem, {loading, error}) => (

            <Form onSubmit={(event) => {
                event.preventDefault(); //stop form to submit
                console.log(this.state);
                }}
            >
                <fieldset>
                    <label htmlFor="title">
                        Title
                        <input 
                        type="text" 
                        id="title" 
                        name="title" 
                        placeholder="Title" 
                        required 
                        value={this.state.title}
                        onChange={this.handleChange}/>
                    </label>

                    <label htmlFor="price">
                        Price
                        <input 
                        type="number" 
                        id="price" 
                        name="price" 
                        placeholder="Price" 
                        required 
                        value={this.state.price}
                        onChange={this.handleChange}/>
                    </label>

                    <label htmlFor="description">
                        Description
                        <textarea
                        type="text" 
                        id="description" 
                        name="description" 
                        placeholder="Enter a Description" 
                        required 
                        value={this.state.description}
                        onChange={this.handleChange}/>
                    </label>
                    <button type="submit">Create</button>
                </fieldset>
            </Form>
        )}
        </Mutation>
        );
    }
}

export default CreateItem;

export { CREATE_ITEM_MUTATION };
