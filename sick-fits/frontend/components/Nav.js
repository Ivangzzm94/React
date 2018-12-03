import Link from 'next/link';

const Nav = () => (
    <div>
        <Link href = "/sell">
        <a>Sell</a>
        </Link>
        <Link href = "/">
        <a>Main</a>
        </Link>
    </div>
);

export default Nav;
