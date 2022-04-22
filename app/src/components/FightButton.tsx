const FightButton = ({ isCreator, expired }: { isCreator?: boolean | null; expired?: boolean }) =>
  !expired ? (
    <button className="bg-primary py-2 w-20 h-10 transition-all cursor-pointer hover:text-white hover:bg-primary-h rounded-3px text-sm">
      {isCreator ? 'View' : 'Fight'}
    </button>
  ) : (
    <button className="bg-primary py-2 w-20 h-10 transition-all cursor-pointer hover:text-white hover:bg-primus-dark-grey rounded-3px text-sm">
      Expired
    </button>
  );

export default FightButton;
