import json
import random
from markov_function.posified_text import *

def produce(event, context):
    if 'queryStringParameters' in event and event['queryStringParameters'] != None:
        seed = event['queryStringParameters']['seed']
        random.seed(seed)

    with open('markov_function/title_chain.json') as f:
        title_data = f.read()
    with open('markov_function/paragraphs_chain.json') as f:
        paragraphs_data = f.read()

    title_model = POSifiedText.from_json(title_data)
    paragraphs_model = POSifiedText.from_json(paragraphs_data)

    paragraphs = paragraphs_model.make_sentence()

    # For some reason double periods keep showing up.  Remove them.
    paragraphs = re.sub(r'\.{2,}', '.', paragraphs)

    # TODO: make paragraph sentences up to a certain max length
    output = {
        'title': title_model.make_short_sentence(240),
        'paragraphs': paragraphs
    }

    #print(json.dumps(output))
    return {
        'statusCode': 200,
        'body': json.dumps(output)
    }