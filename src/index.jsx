import ForgeUI, { render, Fragment, Text, Image, Button, ButtonSet, useState, useProductContext } from "@forge/ui";
import api from "@forge/api";

const SUMMARY_API = 'https://api.meaningcloud.com/summarization-1.0';

const { SUMMARY_API_KEY, DEBUG_LOGGING } = process.env;

const OPTIONS = [
  ['Convert to Image', '2']
];

const Panel = () => {
  const { platformContext: { issueKey } } = useProductContext();
  const [summarization, setSummarization] = useState(null);

  async function setLanguage(countryCode) {
    const issueResponse = await api.asApp().requestJira(`/rest/api/2/issue/${issueKey}?fields=summary,description`);
    await checkResponse('Jira API', issueResponse);
    const { title, description } = (await issueResponse.json()).fields;
    const response = await api.fetch(`http://api.img4me.com/?text=${description}&font=arial&fcolor=000000&size=10&bcolor=FFFFFF&type=png`);
    const summary = (await response.text());
    setSummarization({
      summary: summary,
    });
  }
  
  // Render the UI
  return (
    <Fragment>
      <ButtonSet>
        {OPTIONS.map(([label, code]) =>
          <Button
            text={label}
            onClick={async () => { await setLanguage(code); }}
          />
        )}
      </ButtonSet>
      {summarization && (
        <Fragment>
          <Text content={`**Image**`} />
          <Image
            src={summarization.summary}
            alt="homer"
          />
        </Fragment>
      )}
    </Fragment>
  );
};

async function checkResponse(apiName, response) {
  if (!response.ok) {
    const message = `Error from ${apiName}: ${response.status} ${await response.text()}`;
    console.error(message);
    throw new Error(message);
  } else if (DEBUG_LOGGING) {
    console.debug(`Response from ${apiName}: ${await response.text()}`);
  }
}

export const run = render(<Panel />);
