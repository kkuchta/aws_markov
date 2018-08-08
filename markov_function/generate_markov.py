import markovify
import json
import re

from posified_text import *

with open("./blog_data.json") as f:
    raw_json = f.read()

parsed_json = json.loads(raw_json)
titles = map(lambda post: post['title'].encode("utf8"), parsed_json)
paragraphs = map(lambda post: ". ".join(post['paragraphs']).encode("utf8"), parsed_json)

title_model = POSifiedText( "\n".join(titles))
paragraphs_model = POSifiedText( "\n  ".join(paragraphs), state_size=2)

titles_file = open("title_chain.json", "w")
titles_file.write(title_model.to_json())
titles_file.close()

paragraphs_file = open("paragraphs_chain.json", "w")
paragraphs_file.write(paragraphs_model.to_json())
paragraphs_file.close()
