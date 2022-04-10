import { useState, useEffect } from 'react';
import TextDef from 'i18n/default.json';
import * as sanityAPI from 'api/sanityAPI';

const useAppText = () => {
  const [appText, setAppText] = useState(TextDef);
  const [homePage, setHomepage] = useState(TextDef.homepage);
  const [selectText, setSelectText] = useState(TextDef.prototype);
  const [termsText, setTermsText] = useState(TextDef.term);
  const [globalsText, setGlobalsText] = useState(TextDef.globals);
  const [itemText] = useState(TextDef.item);

  useEffect(() => {
    sanityAPI
      .read({
        type: 'index',
        fields: "'introduction': introduction[0].children[0].text, warning, cta, necrology",
      })
      .then((homepages) => setHomepage(homepages[0]));
    sanityAPI
      .read({
        type: 'burn',
        fields: "'instructions': instructions[0].children[0].text, warning, cta",
      })
      .then((selectPage) => setSelectText(selectPage[0]));
    sanityAPI
      .read({ type: 'terms', fields: "'terms': termsAndConditions" })
      .then((termPage) => setTermsText(termPage[0]['terms']));
    sanityAPI
      .read({
        type: 'globals',
        fields: 'ctaContact, ctaHome, linkDiscord, linkTwitter, tokenPerBurn',
      })
      .then((globals) => setGlobalsText(globals[0]));
  }, []);

  useEffect(() => {
    setAppText({
      ...{ homepage: homePage },
      ...{ item: itemText },
      ...{ prototype: selectText },
      ...{ term: termsText },
      ...{ globals: globalsText },
    });
  }, [homePage, itemText, selectText, termsText, globalsText]);

  return appText;
};

export default useAppText;
