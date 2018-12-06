import UpdateItem from '../components/UpdateItem';

const Sell = props => (
    <div>
        <UpdateItem id={props.query.id}/>
    </div>
);

export default Sell;
// import UpdateItem from '../components/CreateItem';

// const Sell = ({ query }) => (
//     <div>
//         <UpdateItem id={query.id}/>
//     </div>
// );

// export default Sell;

