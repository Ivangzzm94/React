import SingleItem from '../components/SingleItem';
// id={props.query.id} is to pass the id throught SingleItem
const Item = props => (
    <div>
        <SingleItem id={props.query.id}/>
    </div>
);

export default Item;
