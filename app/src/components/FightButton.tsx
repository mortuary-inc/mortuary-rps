const FightButton = ({ isCreator }: { isCreator: boolean | null }) => {
  return (
    <button className="bg-primary py-2 w-20 h-10 transition-all cursor-pointer hover:text-white hover:bg-primary-h rounded-3px text-sm">
      {isCreator ? 'View' : 'Fight'}
    </button>
  );
};

export default FightButton;
