const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv").config()

const app = express()

const PORT=process.env.PORT || 8080

app.use(express.json())
app.use(cors())

const patchFirewallRule = async (ip)=>{
    const projectId = process.env.PROJECT_ID
    const firewallRuleName = process.env.FIREWALL_RULE_NAME

    const compute = require('@google-cloud/compute');
    const computeProtos = compute.protos.google.cloud.compute.v1;
    const firewallsClient = new compute.FirewallsClient();
    const operationsClient = new compute.GlobalOperationsClient();

    const firewallRule = new computeProtos.Firewall();
    firewallRule.sourceRanges = [`${ip}/32`]

    try {
        const [response] = await firewallsClient.patch({
            project: projectId,
            firewall: firewallRuleName,
            firewallResource: firewallRule,
        });
        let operation = response.latestResponse;
        
          // Wait for the create operation to complete.
        while (operation.status !== 'DONE') {
            [operation] = await operationsClient.wait({
              operation: operation.name,
              project: projectId,
            });
        } 
        return "Success"
    } catch(err){
        return err
    }
}
app.post("/", async (req,res)=>{
    const ip = req.query.ip
    const code = await patchFirewallRule(ip)
    if(code === "Success"){
        res.status(200).send("Firewall Updated")
    } else{
        console.log(code)
        res.status(500).send("Error. Kindly Contact Administrators")
    }
})
app.get("/health", (req,res)=>{
    res.status(200).send("Ok")
})
app.listen(PORT, err=>{
    if(err){
        console.log(err)
    } else{
        console.log(`Server started on port ${PORT}`)
    }
})