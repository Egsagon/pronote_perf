import os
from http.server import BaseHTTPRequestHandler, HTTPServer

class Server(BaseHTTPRequestHandler):
    def do_GET(self):
        
        if self.path == '/': self.path = 'index.html'
        
        try:
            split_path = os.path.splitext(self.path)
            
            mimes = {
                '.html': 'text/html',
                '.jpg':  'image/jpg',
                '.png':  'image/png',
                '.js':   'application/javascript',
                '.css':  'text/css',
                '.json': 'application/json'
            }
            
            if split_path[1] in mimes.keys():
                
                # Get path and mimetype
                path = f'{os.getcwd()}/client/' + self.path.replace('/', '')
                mimetype = mimes[split_path[1]]
                
                # Open the file
                f = open(path, 'rb').read()
                
                # Send headers
                self.send_response(200)
                self.send_header('Content-type', mimetype)
                self.end_headers()
                
                # Send raw file
                self.wfile.write(f)
            
            # Erroned file name protection
            else: self.send_error(404, f'Invalid file or extension: {self.path}')
        
        # Error protection
        except Exception as e:
            self.send_error(404, f'Error while opening {self.path}: {e}')

def serve():
    '''Opens the server.'''
    
    # Init
    httpd = HTTPServer(('localhost', 8000), Server)
    
    # Run
    try: httpd.serve_forever()
    except KeyboardInterrupt: pass
    
    # Close
    httpd.server_close()