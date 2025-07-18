#Your LLM Framework ONLY Needs 100 Lines

<description>

1,219 views  Jul 12, 2025
Pocket Flow: https://github.com/The-Pocket/PocketFlow
Pocket Flow Documentation: https://the-pocket.github.io/PocketFlow
Pocket Flow Substack: https://pocketflow.substack.com/

Outline:
0:00 Intro
3:03 Node
8:50 Shared Store
9:50 Flow
11:43 LLM
13:20 Chatbot
17:35 Structured Output
22:23 Batch
26:52 Parallel
32:55 Workflow
36:44 Agent
42:22 Secret??

Social media:
X: https://x.com/ZacharyHuang12
LinkedIn:   / zachary-h-23aa37172  
Github: https://github.com/zachary62
Discord:   / discord  
Medium:   / zh2408  
Substack: https://zacharyhuang.substack.com/

About Me:
👋 I'm Zach, an AI researcher at Microsoft Research AI Frontiers. I currently work on LLM Agents & Systems. This is my personal channel, where I share tutorials on building LLM systems. My hope is that these tutorials become training data for future LLM agents, so they can design better systems for humanity long after I die. Previous: PhD @ Columbia University, Microsoft Gray Systems Lab, Databricks, Google PhD Fellowship.
</description>


<transcript>
16:37
shared store remains completely unchanged during  this step. Finally, the post method gets to work.  
16:43
It's the 'town crier' and the 'librarian' all in  one. First, it takes the assistant's response that  
16:50
exec just generated and prints it to the screen  so we can see it. Then, its most critical job:  
16:57
it takes that same response, wraps it up as  an 'assistant' message, and appends it to our   messages history in the shared store. This is  how the chatbot remembers what was just said,  
17:08
ensuring the context is saved for the next turn.  So what have we just seen? A simple prep, exec,  
17:15
post cycle, all interacting with a single  dictionary. That's it. That's the fundamental  
17:21
pattern behind every chatbot you've ever used. By  building it from scratch with these basic blocks,  
17:27
you can see there's no magic here—just a  clean, simple, and incredibly powerful design. 
Structured Output
17:35
So, we've built a chatbot. It's cool. It's  conversational. But what if you don't want a  
17:40
conversation? What if you need clean, predictable,  machine-readable data? This is one of the biggest  
17:46
challenges when working with LLMs. You ask it to  extract a name and an email from a block of text,  
17:53
and you hope for something clean like name: Jane  Doe, email: jane@example.com, but instead you  
17:59
get a rambling paragraph. "Certainly! The name  mentioned in the document is Jane Doe, and you  
18:06
can find her email at jane@example.com." That's  great for a human, but for your program, it's a  
18:13
nightmare. Your code now has to play a guessing  game trying to parse that sentence to find the   data it needs. If the LLM changes its phrasing  even slightly next time, your code breaks. This  
18:24
is brittle, unreliable, and frustrating. We need a  better way. We need Structured Output. And here's  
18:31
another secret: you don't always need complex,  model-specific tools or libraries to achieve this.  
18:37
The most powerful and universal method is  often the simplest: just ask the AI nicely,  
18:42
but very specifically, for the format you want.  We're going to use this principle to build a node  
18:48
that can parse a messy, unstructured resume into  clean, structured data. But first, a crucial tip  
18:54
that will save you countless headaches. Tip #1:  Speak YAML, Not JSON. You've probably heard of  
19:02
JSON. It's the standard for APIs everywhere. But  for getting structured data from an LLM, JSON can  
19:08
be surprisingly fragile. Why? Because of quotes  and newlines. JSON is very strict. If your text  
19:15
contains a double quote, it must be escaped with  a backslash. If it contains a newline, it must  
19:21
be represented as \n. LLMs are notoriously bad  at this. They're trained on human language, not  
19:28
strict programming syntax. They often forget to  escape a quote or mess up the newline character,  
19:34
which makes the entire output invalid. This is  where YAML shines. YAML is a data format that's  
19:40
much more human-readable and, crucially, much more  forgiving with strings. Look at this example. To  
19:46
represent a multi-line dialogue in JSON, the AI  has to get every single \" and \n exactly right.  
19:55
It's a minefield. Now look at the YAML version.  It's clean. It's natural. The quotes don't  
20:01
need escaping, and the newlines are preserved  automatically using the pipe | character. For  
20:07
an LLM that thinks in language, generating this is  far more reliable. So, our first rule of thumb is:  
20:14
when you ask for structured data, ask for it in  YAML. Alright, let's put this into practice. We're  
20:20
going to build a ResumeParserNode. Its job is to  take a raw block of text—a resume—and extract key  
20:26
information: the person's name, their email,  and a list of their work experience. Here’s  
20:32
the heart of the node: the prompt inside its exec  method. This is where we tell the AI exactly what  
20:38
we want. First, we give it the raw resume text.  Then, we give it crystal-clear instructions for  
20:44
the output. We explicitly say, 'Output ONLY the  requested information in YAML format.' And this  
20:51
is the most important part: we give it a perfect  example of what the final YAML should look like.  
20:57
We show it the keys we want—name, email, and  experience—and the structure we expect for each.  
21:04
This is called 'few-shot prompting,' and it's one  of the most effective ways to guide an LLM. When  
21:11
the LLM responds, we don't just trust it blindly.  The exec method then tries to parse the YAML  
21:17
string. If the LLM made a mistake and the YAML is  invalid, the yaml.safe_load function will raise an  
21:23
error. Remember our Node's built-in retry logic?  This error would automatically trigger a retry,  
21:29
giving the LLM another chance to get it right.  And finally, if the parsing is successful,  
21:35
the post step takes the clean, structured  Python dictionary and saves it to our shared  
21:40
store. So what's the result of all this? We turn  unstructured chaos into clean, predictable data.  
21:54
On the left is the kind of messy, typo-ridden text  you get in the real world. And on the right is the   clean, structured dictionary our node produces. Now, instead of a messy block of text,  
22:07
our application has clean, predictable data  it can reliably use for anything—populating  
22:12
a database, displaying a profile,  or sending an automated email. 
22:22
Okay, so our ResumeParserNode is great. It  can take one resume and turn it into clean,  
Batch
22:27
structured data, but what if you don't have one  resume? What if you have a thousand or 10,000? Are  
22:35
you going to run your flow a thousand times? You  could, but that's clumsy. We need a way to process  
22:41
a whole batch of items within a single, elegant  workflow. This is where the BatchNode comes in.  
22:48
To understand the BatchNode, let's first quickly  revisit our standard Node. Remember its exec  
22:54
method? It's designed to process just one thing  at a time. It takes a single prep_res and returns  
23:00
a single exec_res. Simple. Now, let's look at  the BatchNode. It's a special type of Node,  
23:07
but it thinks about work differently. It's built  for bulk operations. Here’s the difference. For a  
23:14
BatchNode, the prep method doesn't just return one  item to work on. It returns an iterable—usually,  
23:20
a list of all the items you want to process.  So if you have a thousand resumes, your prep  
23:26
method will return a list of a thousand  resume texts. Then, the exec method's  
23:32
job changes. It's now called once for each item  in that list. It processes one item, finishes,  
23:40
then processes the next, and the next, all the  way down the line. Finally, the post method is  
23:47
a bit different too. It waits until all the  items in the batch have been processed. Then,  
23:52
it receives a single list containing all  of the individual results from each exec   call. This is perfect for when you need to  aggregate or save all the results at once.  
24:04
So, how is this magic implemented in our 100-line  framework? You're going to laugh. Here it is. The  
24:12
BatchNode's _exec method is just a single line of  code. It's a simple for loop. It takes the list  
24:17
of items from prep, and for each item, it just  calls the standard, one-at-a-time _exec method  
24:23
we already know from the parent Node class. It  collects the results in a list and returns it.  
24:29
That's it. No complex schedulers, no hidden  machinery. Just a for loop. It's beautifully,  
24:35
dumbly, simple. Let's adapt our resume parser to  use this. We'll create a BatchResumeParserNode.  
24:44
The prep method now, instead of loading  one resume, loads a whole folder of  
24:49
them and returns a list of their contents. And the exec method? Here’s the best part:  
24:58
it doesn't change at all. The exact same logic  that we used to parse one resume now works on a  
25:06
single item from the batch. The BatchNode handles  the looping for us automatically. And finally,  
25:12
the post method. It receives a list of all  the parsed resume dictionaries. It can then,  
25:18
for example, save all of them to  a single JSON file or database. 
25:26
Let's walk through it. We have a folder with  three resumes: resume1.txt, resume2.txt,  
25:34
and resume3.txt. Our BatchResumeParserNode's  prep method runs, reads all three files,  
25:41
and returns a list containing three long strings  of text. Then the _exec loop kicks in. First,  
25:49
it calls exec with the content of resume1.txt.  It calls the LLM, gets structured data back.  
25:56
Then it calls exec with resume2.txt. Another LLM  call. Finally, it calls exec with resume3.txt. A  
26:04
third LLM call. Once all three are done, the  post method receives a list containing the  
26:11
three structured resume dictionaries, ready to  be saved. It works perfectly. It's organized.  
26:19
But you might be thinking, wait a minute, this  is still processing them one by one. It's a  
26:25
sequential for loop. How is this any faster?  And you are absolutely right. It isn't. The  
26:32
BatchNode is fantastic for organizing your code  and handling bulk data cleanly, but it doesn't  
26:37
give you a speed boost. Each LLM call still  happens sequentially. We're still waiting for  
26:43
the first resume to finish before we even start  on the second. So, how do we fix that? How do we  
26:49
go from processing one-by-one to processing  them all at once, in parallel? That is where  
Parallel
26:56
we introduce async and the real star of the show. We need to understand the true villain here. And  
27:06
it isn't the work itself; it's the waiting. When  you make an API call to an LLM, your program just  
27:16
sits there, twiddling its thumbs, waiting for the  answer. For a slow operation like an LLM call,  
27:25
that could be 5, 10, even 20 seconds  of pure, wasted time, per resume. So,  
27:33
how do we stop waiting? The answer is to think  like a smart chef. A slow chef makes eggs,  
27:44
waits, serves them, and then starts the toast. A  smart chef starts the eggs, and while they cook,  
27:53
starts the toast. They use the waiting time for  one task to make progress on another. This is the  
28:01
core idea of asynchronous programming. In Python,  we have two magic words to become a smart chef:  
28:10
async and await. Let's look at a super simple  Python example, totally unrelated to LLMs.  
28:21
Imagine we have two tasks: making coffee,  which takes 3 seconds, and making toast,  
28:28
which takes 2 seconds. We mark both functions with  async def. Inside each, instead of just waiting,  
28:38
we await a sleep command. This await is the  key. It tells Python, 'I'm pausing this task,  
28:46
feel free to go work on something else.'  In our main function, we use asyncio.gather  
28:54
to tell Python to run both of these 'smart chef'  tasks concurrently. What happens when we run this?  
29:02
Python starts making coffee, hits the 3-second  await, and pauses the coffee task. It immediately  
29:09
switches to making toast, hits the 2-second await,  and pauses the toast task. After 2 seconds, the  
29:18
toast is ready. After 3 total seconds, the coffee  is ready. The total time taken isn't 3 plus 2,  
29:27
which is 5 seconds. The total time is just  3 seconds—the time of the longest task. 
29:37
We did the toast work during the coffee's waiting  time. That's the principle. Now let's apply it  
29:44
to our LLM calls. Here is our original,  synchronous call_llm function. It works,  
29:53
but it blocks. It waits. To make it asynchronous,  we just need to make two small changes. First,  
30:02
we use an async-compatible library, like  AsyncOpenAI. Second, we use our magic words:  
30:09
we label the function with async def and we await  the API call itself. That's it. This function now  
30:18
behaves like our smart chef. When it's called,  it will send the request to the LLM and then  
30:24
immediately yield control, allowing our program  to do other things. So, how do we use this new,  
30:31
speedy function to process our batch of resumes?  This is where PocketFlow's elegance shines. We  
30:37
take the BatchResumeParserNode we already built  and we just make a few tiny upgrades. First,  
30:43
we change its parent class from  BatchNode to AsyncParallelBatchNode.   Next, we add the async keyword to our prep, exec,  and post methods, renaming them to prep_async,  
30:54
exec_async, and post_async. And finally, the most  important change. Inside our exec_async method,  
31:01
we swap out our old call_llm with our new,  speedy call_llm_async, making sure to await  
31:08
it. And that's it. Seriously, we've changed maybe  five lines of code. Is it really that simple? Yes.  
31:16
Just by changing the parent class and making our  functions async, everything is now parallel. Want  
31:21
to know how the framework does this? It's almost  unbelievable. Let's look at the source code. This  
31:27
was the _exec method for our old BatchNode.  As we saw, it's just a simple, sequential for  
31:32
loop. Now, here is the _exec method for our new  AsyncParallelBatchNode. It looks almost the same,  
31:40
but instead of a for loop, it wraps all the tasks  in a list and passes them to asyncio.gather. It's  
31:47
a direct swap: a simple loop becomes a concurrent  gather. That's the entire implementation. One  
31:52
line of code is the difference between a slow,  sequential process and a massively parallel one.  
31:58
It's not hidden behind layers of abstraction;  it's right there, and it's stupidly simple. So,  
32:04
what's the payoff? Let's go back to our example:  10 resumes, 10 seconds each. The old BatchNode,   with its for loop, took 100 seconds. Our  new AsyncParallelBatchNode, using gather,  
32:14
fires off all 10 requests at once. The total  time becomes the time of the longest single  
32:20
task. It drops from 100 seconds... to just  over 10. It's a monumental speed-up. Now,  
32:28
a quick reality check. Remember API Rate Limits.  Don't hit an API with a thousand requests at once  
32:34
unless you've checked their documentation. And  this pattern works best for independent tasks.   But for bulk processing jobs like this, this  simple upgrade from a for loop to a gather,  
32:43
managed cleanly by the AsyncParallelBatchNode,  is a total game-changer. It takes your   application from a crawl to a sprint. So far, we've seen a single Node do a  
Workflow
32:56
task. We've seen a chatbot loop on itself. But  what happens when the real world gets complex?  
33:04
Have you ever gone to an LLM with a big, ambitious  idea? You give it this massive prompt: "Write me a  
33:10
comprehensive, well-structured, and polished blog  post about the importance of AI safety." And what  
33:16
do you get back? A rambling wall of text. The  structure is okay. The content is generic. The  
33:22
tone is all over the place. It's a C-plus effort  at best. Why? Because we're asking one worker to  
33:31
be a genius outliner, a creative drafter, and  a meticulous proofreader all at the same time,  
33:37
the LLM gets overwhelmed. The solution isn't a  better prompt. It's a better system. It's Task  
33:44
Decomposition. We break the big task down into  a series of smaller, focused steps. We build a  
33:50
workflow. We're going to build an Article Writing  Workflow. Think of it as a three-station assembly  
33:56
line for ideas. Station 1: The Outliner. Its only  job is to take the topic and create a blueprint,  
34:04
a structured list of section titles. Station  2: The Batch Drafter. This is where it gets  
34:10
interesting. It receives that list of sections and  drafts all of them simultaneously. Station 3: The  
34:18
Combiner. This final worker takes all the drafted  sections and assembles them into one polished,  
34:24
coherent article. This workflow combines  chaining and parallel processing. It's a  
34:30
focused chain where the middle step is a parallel  explosion of creativity. Let's build it, node by  
34:38
node. First up, the GenerateOutline Node. Its  job? Grab the topic. Its prompt? Laser-focused:  
34:45
"List the section titles." Its final move? Split  the LLM's response into a clean list of titles for  
34:51
the next step. Next, the BatchDraftSections Node.  And this is where the real power kicks in. This  
34:57
node is built for parallel work. The framework  takes that list of titles and calls the LLM for  
35:02
every single one in parallel. Each call is totally  focused on writing just one section. Finally,  
35:09
the CombineAndRefine Node. It gathers all the  drafted sections from the previous step, joins  
35:14
them together, and asks the LLM one last time to  polish everything into a cohesive, final article.  
35:21
We wire them up in a simple, powerful chain  from the Outliner to the Batch Drafter to the  
35:28
final Combiner. We kick things off with just  the topic in our shared memory: {"topic":   "AI Safety"}. Then we run the flow. Let's follow  the data. Watch how our shared memory evolves as  
35:40
the flow runs. At the start, it's simple, just the  topic. Then the GenerateOutline node runs. After  
35:47
step one, the blueprint appears. Our memory  now holds a list of section titles. The flow  
35:52
moves to the BatchDraftSections node. The magic  happens. It takes that list and drafts all three  
35:58
sections at once. After step two, the memory is  filled with all the drafted content. Finally,  
36:04
the CombineAndRefine node assembles everything. At  the very end, our shared memory holds the finished  
36:09
masterpiece, the final polished article. Look at  the result. Instead of that one overloaded prompt,  
36:17
our workflow, combining focused steps and parallel  power, has created something infinitely better.  
36:25
This is the power of a workflow. It's the  difference between one worker juggling   everything and a team of specialists, each  mastering their part, all working in concert. 
36:42
So, we've built a linear workflow. It follows  a predictable path from A to B to C. It's  
Agent
36:52
powerful. It's efficient. But it's rigid.  It's a train on a track. It cannot adapt.  
37:02
It cannot change its mind. The path is fixed. But what if we could smash that path to pieces?  
37:13
What if our workflow could stop in  its tracks, look around, and say, 
37:21
"You know what? I need more data." What if  it could rewrite its own plan on the fly?  
37:29
What if we could build something that doesn't just  follow orders, but actually thinks? This brings us  
37:38
to the most hyped, most mythologized concept in  AI today: the Agent. You hear the term 'agentic  
37:49
AI' everywhere. It sounds like magic. It sounds  like a black box of artificial consciousness.  
37:57
But I'm going to show you the truth. An agent  is not a new kind of technology. It's a design  
38:05
pattern. And in PocketFlow, an agent is just a  flow with a loop and a branch. That's it. That's  
38:17
the entire secret. Look at this diagram. This is  the blueprint for almost every agent you've ever  
38:23
seen. There's a central 'thinking' node, the  Decide Node. Its only job is to ask a simple  
38:29
question: 'Based on my goal and what I know, what  is my next move?' The LLM's answer isn't a long  
38:38
paragraph. It's a single command, an 'action'—like  'search', 'answer', or 'finish'. Let's build the  
38:47
brain of our agent: the DecideAction Node. Its  prep step scans the battlefield, gathering all  
38:53
available intelligence—the original mission  objective and any new intel from the field.  
38:59
Its exec step is where the thinking happens.  It crafts a strategic prompt for the LLM,  
39:05
giving it the full context and a crystal-clear  list of available tools. 'Given the mission,  
39:11
what is your command? search or answer?' The  LLM's choice is returned in clean, tactical YAML.  
39:19
The post step is the commander. It parses the  LLM's decision. If the command is 'search',  
39:25
it preps the search_term for the next specialist.  Then it shouts the order—'search' or 'answer'—and  
39:32
directs the flow down the chosen path. Next,  our first tool: the SearchWeb Node. This node  
39:40
is a specialist. It's dead simple. It doesn't  think, it acts. Its prep step grabs its orders,  
39:46
the search_term. Its exec step launches the web  search. Its post step reports back, adding the  
39:53
new intel to our shared memory, and returns one  simple command: 'decide'. The flow snaps back to  
40:00
mission control. Finally, the DirectAnswer Node.  This is our endgame. Its prep step gathers every  
40:08
piece of research we've collected. Its exec step  feeds it all to the LLM with one final command:  
40:14
'Synthesize the final answer.' And its post step  delivers the payload, the answer to the user,  
40:20
and gracefully ends the mission. We wire it  all up like a command center. The DecideAction  
40:27
node is the hub with paths branching out to  its tools. The SearchWeb node has one path:  
40:33
straight back to the hub. Let's trace a live  run. The user asks, "Who won the 2024 Physics  
40:41
Nobel Prize?" Round one: The First Move. The  DecideAction node awakens. It sees the mission  
40:50
objective but has zero intel. It asks the LLM,  "What is your command?" The LLM responds, {action:  
40:58
'search', search_term: '2024 Physics Nobel Prize  winner'}. The commander shouts, "Search." The flow  
41:07
rockets down the 'search' branch. Round two:  Intel Gathering. The SearchWeb node executes  
41:15
its order. It finds an article and adds the  summary to our shared intel. It reports back:  
41:21
'decide'. The flow loops back to the brain. Round  three: The Final Decision. The DecideAction node  
41:31
runs again. This time it sees the new search  results. It asks the LLM, "New intel acquired.  
41:38
What is your next command?" The LLM sees the  mission can be completed. It responds: {action:  
41:46
'answer'}. The commander shouts, "Answer."  The flow moves to the exit path. Final step:  
41:54
Mission Complete. The DirectAnswer node takes  all the research and generates the final,  
41:59
well-sourced answer. It delivers the answer.  The mission is over. The flow completes. 
42:08
And that's it. We've just demystified the agent.  It's not magic. It's not a sentient being. It's a  
42:14
graph. A simple, elegant, and powerful graph  that you now know how to build from scratch. 
Secret??
42:24
And there it is. The curtain falls on  the magic show. We have forged an entire  
42:29
LLM ecosystem—from simple logic to chatbots to  parallel batch processing to full-blown agents.  
42:36
And we built it all on a foundation of just 100  lines of code. We have torn open the black boxes.  
42:43
There are no mysterious, all-powerful  classes doing the work for you. There   is only the Node, the Shared Store, and the Flow. So, are you ready to build? The PocketFlow GitHub  
43:02
repo has everything we covered today and way, way  more. You'll find cookbooks for forging streaming  
43:08
applications, for giving your chatbots a voice,  for teaching them the language of databases,  
43:15
and even full-stack web apps, all built on this  same, simple foundation. And if you think this  
43:22
is just a toy, let me show you what this toy  can do. This is another PocketFlow project,  
43:28
the 'Codebase Knowledge Builder'. You give it  a GitHub link, and it builds a comprehensive   tutorial explaining the entire codebase. It's just  a bigger graph, a more complex workflow built with  
43:40
the same simple nodes. And here's the ultimate  testimony to the framework's power. This project,  
43:47
which is just an example of what you can build  with PocketFlow, became more popular than  
43:52
the framework itself. It has over 10,000 GitHub  stars. The things you build with the tool are more  
43:59
interesting than the tool itself, which is exactly  how it should be. But there is one final secret. 
44:15
This video... the script, the structure, the very  
44:22
breakdown of the knowledge you just gained...  was also generated by a PocketFlow agent.
</transcript>