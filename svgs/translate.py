#This will work on inkscape files with absolute path coordinates.  To set a file to use absolute, go to File->Inkscape #Preferences->svg output and uncheck 'allow relative coordinates'.  To make sure your current svg starts to use these, #select all and move by a pixel and it'll update as appropriate.

from xml.dom import minidom
from lxml import etree
import json
import sys
from pathparser import PathIterator

def namespace(tag):
	ns =  "{http://www.w3.org/2000/svg}%s" % tag
	return ns

def translate(amount, value):
	return value + amount
		
filename = sys.argv[1]

with open(filename, 'r') as infile:
	tree = etree.parse(infile)

for element in tree.xpath("//n:g", namespaces={'n':"http://www.w3.org/2000/svg"}):
	print element.tag
	print element.get("transform")
	for child in element.iter("*"):
		if child.tag == namespace("path"):
			
			print child.get("id")
			p = PathIterator(child.get("d"))
			m = []
			for type, char in p:
				if type == "M":
					m = char 
					
				if type == "C":
					xcomp = char[0::2]
					ycomp = char[1::2]
					xadd = -min(xcomp)
					yadd = -min(ycomp)	
					xtrans = [x + xadd for x in xcomp]
					ytrans = [y + yadd for y in ycomp]
					translated = [val for pair in zip(xtrans,ytrans) for val in pair]
				
					
					print "M " + str(m[0]+xadd) + "," + str(m[1]+yadd) +  " " + type + ' ' + ', '.join(str(x) for x in translated) + ' z'
					
					





