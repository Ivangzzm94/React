import Singup from '../components/Singup';
import Signin from '../components/Signin';
import RequestReset from '../components/RequestReset';
import styled from 'styled-components';

const Columns = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px,1fr));
    grid-gap: 20px;
`;

const SingupPage = props => (
    <Columns>
        <Singup />
        <Signin />
        <RequestReset />
    </Columns>
);

export default SingupPage;
