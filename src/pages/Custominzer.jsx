import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSnapshot } from 'valtio';
import config from '../config/config';
import state from '../store';
import { download } from '../assets';
import { downloadCanvasToImage, reader } from '../config/helpers';
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants';
import { fadeAnimation, slideAnimation } from '../config/motion';
import { AIPicker, ColorPicker, CustomButton, FilePicker, Tab } from '../components';

const Custominzer = () => {
    const snap = useSnapshot(state)

    const [file, setFile] = useState('')
    const [prompt, setPrompt] = useState('')
    const [generatingImg, setGeneratingImg] = useState(false)
    const [activateEditorTab, setActiveEditorTab] = useState("")
    const [activateFilterTab, setActiveFilterTab] = useState({
        logoShirt: true,
        stylishShirt: false,
    })


    const generateTabContent = () => {
        switch (activateEditorTab) {
            case "colorpicker":
                return <ColorPicker />
            case "filepicker":
                return <FilePicker
                    file={file}
                    setFile={setFile}
                    readFile={readFile}
                />
            case "aipicker":
                return <AIPicker
                    prompt={prompt}
                    setPrompt={setPrompt}
                    generatingImg={generatingImg}
                    handleSubmit={handleSubmit}
                />

            default:
                return;
        }
    }

    const handleSubmit = async (type) => {
        if (!prompt) return alert("please enter a prompt")

        try {
            setGeneratingImg(true);

            const response = await fetch('https://threejsshop-backend.onrender.com/api/v1/dalle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt,
                })
            })

            const data = await response.json();

            handleDecals(type, `data:image/png;base64,${data.photo}`)

        } catch (error) {
            alert(error)
        } finally {
            setGeneratingImg(false);
            setActiveFilterTab("");
        }
    }

    const handleDecals = (type, result) => {
        const decalType = DecalTypes[type];
        state[decalType.stateProperty] = result;

        if (!activateFilterTab[decalType.filterTab]) {
            handleActiveFilterTab(decalType.filterTab)
        }

    }

    const handleActiveFilterTab = (tabName) => {
        switch (tabName) {
            case 'logoShirt':
                state.isLogoTexture = !activateFilterTab[tabName];
                break;
            case "stylishShirt":
                state.isFullTexture = !activateFilterTab[tabName];
                break;
            default:
                state.isFullTexture = false;
                state.isLogoTexture = true;
                break;
        }

        setActiveFilterTab((prevState) => {
            return {
                ...prevState,
                [tabName]: !prevState[tabName]
            }

        })
    }

    const readFile = (type) => {
        reader(file)
            .then((result) => {
                handleDecals(type, result);
                setActiveEditorTab("");
            })

    }


    return (
        <AnimatePresence>
            {!snap.intro && (
                <>


                    <motion.div
                        key="custom"
                        className="absolute top-0 left-0 z-10"
                        // {...slideAnimation('left')}
                        {...fadeAnimation}
                    >
                        <div className="flex items-center min-h-screen">
                            <div className="editortabs-container tabs">
                                {EditorTabs.map((tab) => (
                                    <Tab
                                        key={tab.name}
                                        tab={tab}
                                        handleClick={() => {
                                            // Toggle the activeEditorTab state
                                            setActiveEditorTab((prevTab) =>
                                                prevTab === tab.name ? '' : tab.name
                                            );
                                        }}
                                    />
                                ))}

                                {generateTabContent()}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div className="absolute z-10 top-5 right-5" {...fadeAnimation}>
                        <CustomButton
                            type="filled"
                            title="Go Back"
                            handleClick={() => state.intro = true}
                            customStyles="w-fit px-4 py-2.5 font-bold text-sm"
                        />
                    </motion.div>

                    <motion.div
                        className="filtertabs-container"
                        {...slideAnimation('up')}
                    >
                        {FilterTabs.map((tab) => (
                            <Tab
                                key={tab.name}
                                tab={tab}
                                isFilterTab
                                isActiveTab={activateFilterTab[tab.name]}
                                handleClick={() => handleActiveFilterTab(tab.name)}
                            />
                        ))}

                        <button className='download-btn' onClick={downloadCanvasToImage}>
                            <img
                                src={download}
                                alt='download_image'
                                className='w-3/5 h-3/5 object-contain'
                            />
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default Custominzer
