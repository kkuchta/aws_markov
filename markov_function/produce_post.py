import json
import random
import base64
from markov_function.posified_text import *

def produce(event, context):
    print(event)
    title = None
    if 'queryStringParameters' in event and event['queryStringParameters'] != None:
        title64 = event['queryStringParameters']['title64']
        title = base64.b64decode(title64).decode("utf-8")

    else:
        with open('markov_function/title_chain.json') as f:
            title_data = f.read()
        title_model = POSifiedText.from_json(title_data)
        title = title_model.make_short_sentence(240)

    random.seed(title)
    with open('markov_function/paragraphs_chain.json') as f:
        paragraphs_data = f.read()

    paragraphs_model = POSifiedText.from_json(paragraphs_data)
    paragraphs = paragraphs_model.make_sentence()

    # For some reason double periods keep showing up.  Remove them.
    paragraphs = re.sub(r'\.{2,}', '.', paragraphs)

    # TODO: make paragraph sentences up to a certain max length
    output = {
        'title': title,
        'paragraphs': paragraphs
    }

    #print(json.dumps(output))
    return {
        'statusCode': 200,
        'body': json.dumps(output)
    }
