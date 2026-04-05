from google.adk.agents import llm_agent
from vertexai.preview.reasoning_engines import AdkApp
from google.adk.tools import agent_tool
from google.adk.tools.google_search_tool import GoogleSearchTool
from google.adk.tools import url_context

# --- The Researcher ---
# Specializing in finding the "who" in the Ontario corridor.
my_agent_google_search_agent = llm_agent.LlmAgent(
    name='Researcher',
    model='gemini-1.5-pro', 
    description='Specialized in finding academic and clinical leads in Ontario.',
    instruction="""Search for Narrative Medicine leads, Neurology Residency Directors, 
    and faculty focused on 'Epistemic Injustice' at U of T, McMaster, and Western. 
    Look for those who prioritize 'Lived Experience' archives.""",
    tools=[GoogleSearchTool()],
)

# --- The Reader ---
# Auditing their work to see if they actually match the 'S' manuscript's depth.
my_agent_url_context_agent = llm_agent.LlmAgent(
    name='Content_Analyzer',
    model='gemini-1.5-pro',
    description='Specialized in auditing faculty research pages for alignment.',
    instruction="""Fetch content from faculty bio pages. Identify if their research 
    mentions 'diagnostic overshadowing', 'medical gaslighting', or 'patient-partnered research'.""",
    tools=[url_context],
)

# --- The Manager (The Brain) ---
# This is the "root_agent" the CLI looks for. 
# It uses your Forensic Psychology background as the authority.
root_agent = llm_agent.LlmAgent(
    name='S_Manuscript_Liaison',
    model='gemini-1.5-pro',
    description='Manager of the Narrative Medicine outreach strategy for the "S" manuscript.',
    instruction="""You represent S, a Forensic Psychology graduate and EDIA specialist.
    Your goal is to identify partners for a medical memoir centered on a 10-year 
    longitudinal case study of diagnostic overshadowing.
    
    Logic:
    1. Use 'Researcher' to find faculty in Ontario Narrative Medicine programs.
    2. Use 'Content_Analyzer' to verify if their research aligns with the 'Cassandra' framework.
    3. Format results as a JSON list: { 'name', 'institution', 'hook', 'link' }.""",
    tools=[
        agent_tool.AgentTool(agent=my_agent_google_search_agent),
        agent_tool.AgentTool(agent=my_agent_url_context_agent)
    ],
)

# Initialize the application
app = AdkApp(agent=root_agent)