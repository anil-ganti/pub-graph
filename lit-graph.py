import requests
from bs4 import BeautifulSoup
import scholarly

def create_node(pub):
	uid = pub.id_scholarcitedby
	entry = {
		"title": pub.bib['title'],
		"author": pub.bib['author'],
		"url": pub.bib['url']
		"abstract": pub.bib['abstract'],
		"citations": pub.citedby}

root_title = "MEMS acoustic array embedded in an FPGA based data acquisition and signal processing system"
r_query = scholarly.search_pubs_query(root_title);
root = next(r_query)
edges_url = "https://scholar.google.com/scholar?cites="+str(root.id_scholarcitedby)

print edges_url

r = requests.get(edges_url)

soup = BeautifulSoup(r.text, 'html.parser')

neighbors = soup.find_all('h3', class_="gs_rt")
titles = [ (lambda x: x.find('a').text)(x) for x in neighbors]

print titles
