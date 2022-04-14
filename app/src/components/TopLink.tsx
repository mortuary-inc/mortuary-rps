import Disconnect from '../features/Connect/Disconnect';
import Connect from 'features/Connect/Connect';
import 'components/Footer/Footer.css';
import LogoText from './LogoText';
import { Button } from './Button';
import { ReactComponent as ArrowLeftSVG } from 'assets/arrow-left.svg';
import { useHistory } from 'react-router-dom';

const TopLink = () => {
  const history = useHistory();
  return (
    <div className="flex row justify-between">
      <div className="flex justify-start">
        <Button variant="secondary" className="h-10 px-3 mr-2" onClick={() => history.goBack()}>
          <ArrowLeftSVG />
        </Button>
        <Button variant="secondary" className="h-10 px-6 mr-1" onClick={() => {}}>
          INFO
        </Button>
      </div>
      <LogoText />
      <div className="">
        <Connect />
        <Disconnect className="py-1 h-10" />
      </div>
    </div>
  );
};

export default TopLink;
