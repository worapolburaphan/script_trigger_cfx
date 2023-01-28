# Script Trigger

Script Trigger is a FiveM resource that simplifies the process of setting up and running scripts, making it easy to run custom script hooks when a resource starts. It allows developers to focus on creating their projects instead of worrying about the technical details, making it an invaluable tool for any FiveM developer looking to streamline their workflow.

# Getting Started
### Installation
1. Download the script_trigger resource from this GitHub repository.
2. Add the script_trigger resource to your server.cfg file under the resources section.
3. Start the server and ensure that the script_trigger resource is running.

## How to use script_trigger
In the `fxmanifest.lua` of any resource, add the following line: 
```lua 
script_trigger 'command'
script_trigger_cached 'true' -- true script will run once / false script will run everytime restart resource
``` 
This will execute the specified command when the resource is started. The command can be any valid script or command, such as creating a web server or running a database query or any script that u want. 

 ## Contributing 
If you would like to contribute to this project, please feel free to submit a pull request with your changes!