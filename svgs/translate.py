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
	#print element.tag
	#print element.get("transform")
	
	for child in element.iter("*"):
		if child.tag == namespace("path"):
			
			
			
			p = PathIterator(child.get("d"))
			m = []
			mstr = None
			cstr = None
			lstr = None
			xadd = float("inf")
			yadd = float("inf")
			
			lxcomp = []
			lycomp = []
			cxcomp = []
			cycomp = []
			
			#this loop should appends each type and components to a list, and then iterates through the list 
			#and at the end to constructs the final translated path
			
			#first pull out all x and y components
			xcomp = []
			ycomp = []
			finalpath = []
			
			for type, char in p:
				if type == "M":
					m = char 
					finalpath.append({"type":"M", "xcomp":[m[0]], "ycomp":[m[1]]})
					
				if type == "L" or type == "C":
					xs = char[0::2]
					ys = char[1::2]
					xcomp.extend(xs)
					ycomp.extend(ys)
					finalpath.append({"type":type, "xcomp":xs, "ycomp":ys})
						
			
			minx = min(xcomp)
			maxx = max(xcomp)
			
			miny = min(ycomp)
			maxy = max(ycomp)
			
			width = maxx - minx
			height = maxy - miny
			
			xadjust = -minx
			yadjust = -miny
			 
			pathstring = ""
			
			translatedpath = []
			
			for path in finalpath:
				xtrans = [x + xadjust for x in path['xcomp']]
				ytrans = [y + yadjust for y in path['ycomp']]
				translatedpath.append({"type":path['type'], "xcomp":xtrans, "ycomp":ytrans})
				translated = [val for pair in zip(xtrans,ytrans) for val in pair] 
				pathstring = pathstring + " " + path["type"] + " " + ', '.join(str(x) for x in translated)
			
			print  child.get("id"),"=",{"path":translatedpath, "width": width, "height":height},","

					





