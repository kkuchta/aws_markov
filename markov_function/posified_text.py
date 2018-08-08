import markovify
import re

# Hack since nltk doesn't _really_ need sqlite for the stuff we're doing and
# it's not available on amazon's lambda envs
import imp
import sys
sys.modules["sqlite"] = imp.new_module("sqlite")
sys.modules["sqlite3.dbapi2"] = imp.new_module("sqlite.dbapi2")
import nltk

# with newline split
class POSifiedText(markovify.Text):
    def sentence_split(self, text):
        return re.split(r"\s*\n\s*", text)

    def word_split(self, sentence):
        words = re.split(self.word_split_pattern, sentence)
        words = [ "::".join(tag) for tag in nltk.pos_tag(words) ]
        return words

    def word_join(self, words):
        sentence = " ".join(word.split("::")[0] for word in words)
        return sentence
