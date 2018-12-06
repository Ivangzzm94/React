import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Form from './styles/Form';
import gql from 'graphql-tag';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';
import Router from 'next/router';

const CREATE_ITEM_MUTATION = gql`
    mutation CREATE_ITEM_MUTATION (
        $title: String!
        $description: String!
        $price: Int!
        $image: String
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

    uploadFile = async event => {
        console.log('uploading file...');
        const files = event.target.files;
        const data = new FormData();
        // first item selected
        data.append('file', files[0]);
        //this is for cloudinary
        data.append('upload_preset', 'sick-fits');

        const res = await fetch('https://api.cloudinary.com/v1_1/dsqwgzfb5/image/upload', {
            method: 'POST',
            body: data
        });
        const file = await res.json();
        console.log(file);
        this.setState({
            image: file.secure_url,
            largeImage: file.eager[0].secure_url
        });
    };

    // Apollo turn loadings on and off

    render() {
        return (
            <Mutation mutation={CREATE_ITEM_MUTATION} variables = {this.state}>
                {(createItem, {loading, error}) => (

            <Form 
                onSubmit={async event => {
                    //stop form to submiting
                    event.preventDefault(); 
                    //call the mutation
                    const res = await createItem();
                    //change theem to the single item page
                    
                    console.log(res);
                    Router.push({
                        pathname: '/item',
                        query: { id: res.data.createItem.id }
                    });
                }}
            >
                <Error error={error} />
                <fieldset disabled={loading} aria-busy={loading}>
                    <label htmlFor="file">
                        Image
                        <input 
                        type="file" 
                        id="file" 
                        name="file" 
                        placeholder="Upload an image" 
                        required
                        //every time we click choose file is gona trigger uploadingFile...
                        onChange={this.uploadFile}
                        />
                        {this.state.image && <img src= {this.state.image} alt="Upload Preview"/>}
                    </label>
                    
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
