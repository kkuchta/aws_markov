import json
from posified_text import *

with open('title_chain.json') as f:
    title_data = f.read()
with open('paragraphs_chain.json') as f:
    paragraphs_data = f.read()

title_model = POSifiedText.from_json(title_data)
paragraphs_model = POSifiedText.from_json(paragraphs_data)

paragraphs = paragraphs_model.make_sentence()

# For some reason double periods keep showing up.  Remove them.
paragraphs = re.sub(r'\.{2,}', '.', paragraphs)

# TODO: make paragraph sentences up to a certain max length
output = {
    'title': title_model.make_short_sentence(240),
    'paragraphs': paragraphs_model.make_sentence()
}

print json.dumps(output)
