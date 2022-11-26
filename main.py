import os, json, server, threading, webbrowser

path = os.getcwd()

# Import pronotepy
pronotepy = ile_de_france = None
exec('import pronotepy\nfrom pronotepy.ent import ile_de_france')

# Init client
url, usr, pwd = json.load(open(f'{path}\\creds.json', 'r')).values()
client = pronotepy.Client(url, username = usr, password = pwd, ent = ile_de_france)

if not client.logged_in: exit('Failed to connect to ENT')

# Fetch grades
subjects = {}

# French float (with comma)
ffloat = lambda s: float(s.replace(',', '.'))

slots: dict[str: object] = {
    'grade':            ffloat,
    'out_of':           int,
    'default_out_of':   int,
    'date':             lambda o: o.isoformat(),
    'subject':          lambda o: o.name.title(),
    'period':           lambda o: o.name,
    'average':          ffloat,
    'max':              ffloat,
    'min':              ffloat,
    'coefficient':      ffloat,
    'comment':          str,
    'is_bonus':         bool,
    'is_optionnal':     bool,
    'is_out_of_20':     bool
}

for grade in client.current_period.grades:
    
    # Fetch data
    sub = grade.subject.name.title()
    
    # Parse to dict
    inf = {}
    for s in grade.__slots__:
        if s in slots:
            obj = getattr(grade, s)
            inf[s] = 'unset' if obj is None else slots[s](obj)
    
    # Append to subjects
    if not sub in subjects.keys(): subjects[sub] = [inf]
    else: subjects[sub] += [inf]

# Write to data
open(f'{path}\\client\\grades.json', 'w').write(json.dumps(subjects))

# Open in browser
threading.Thread(target = server.serve).start()
webbrowser.open('http://localhost:8000/')
