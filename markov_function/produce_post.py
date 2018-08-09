import json
import random
from itertools import repeat
from markov_function.posified_text import *

MIN_POST_LENGTH = 1000

# Fast but ugly.  Generates the whole post in one go, then splits it up into
# paragraphs.
def make_paragraphs_splitting(paragraphs_model):
    paragraphs = []
    sentence_blob = ""
    while len(sentence_blob) < MIN_POST_LENGTH:
        target_length = 5000 - len(sentence_blob)
        print("target_length=" + str(target_length))
        sentence_blob += paragraphs_model.make_short_sentence(target_length, tries=100)
    print("got length" + str(len(sentence_blob)))

    # For some reason double periods keep showing up.  Remove them.
    re.sub(r'\.{2,}', '.', sentence_blob)
    sentences = list(map(lambda s: s.strip(), sentence_blob.split('. ')))
    while len(sentences) > 1:
        n = random.randint(2,7)
        paragraph = ". ".join(sentences[:n])
        paragraph = re.sub(r'\.{2,}', '.', paragraph)
        paragraphs.append(paragraph)
        sentences = sentences[n:]
    return paragraphs

# Slow, but better-looking.  Generates sentence by sentence.
def make_paragraphs_iterating(paragraphs_model):
    paragraphs = []
    paragraph_count = random.randint(2,7)

    for i in repeat(None, paragraph_count):
        sentence_count = random.randint(2, 7)
        paragraph = ""
        for i in repeat(None, sentence_count):
            sentence = paragraphs_model.make_short_sentence(random.randint(100,300), tries=100)
            sentence = re.sub(r'\.{2,}', '.', sentence)
            paragraph = paragraph + " " + sentence

        paragraphs.append(paragraph)

    return paragraphs

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

    paragraphs = make_paragraphs_splitting(paragraphs_model)
    #paragraphs = make_paragraphs_iterating(paragraphs_model)

    # TODO: make paragraph sentences up to a certain max length
    output = {
        'title': title_model.make_short_sentence(240),
        'paragraphs': paragraphs
    }

    #print(json.dumps(output, indent=4))
    return {
        'statusCode': 200,
        'body': json.dumps(output)
    }
