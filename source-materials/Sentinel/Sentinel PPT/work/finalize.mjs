import fs from 'node:fs/promises';
import {finalizePresentation} from '/Users/kevinwang/.codex/plugins/cache/openai-primary-runtime/presentations/26.1015.12040/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root=process.cwd();
process.env.RUNTIME_NODE_MODULES='/Users/kevinwang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const inventory=JSON.parse(await fs.readFile('work/source_inventory.json','utf8'));
const skill='/Users/kevinwang/.codex/plugins/cache/openai-primary-runtime/presentations/26.1015.12040/skills/presentations';
const result=await finalizePresentation({
 workspaceDir:root,
 candidatePath:root+'/work/post-native-candidate.pptx',
 finalPath:root+'/deliverables/Sentinel_S5_Webinar_Mac_Animated_Demo.pptx',
 explicitTotalSlideCount:16,
 requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],
 pythonExecutable:'/Users/kevinwang/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
 integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',
 layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],
 fontPolicy:{basis:'reference',families:['Arial'],referencePath:root+'/Sentinel-Product-Presentation.pptx',referenceSha256:inventory['Sentinel-Product-Presentation.pptx'].sha256},
 verifyArtifactToolImport:true,
 receiptPath:root+'/work/delivery-validation.json'
});
console.log(JSON.stringify(result));
