import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { Car } from "./Car";
import Player from "./Player";
import { Ground } from "./Ground";
import { Track } from "./Track";
export function Scene() {
  const [thirdPerson, setThirdPerson] = useState(false);
  const [cameraPosition, setCameraPosition] = useState([-6, 1.9, 6.21]);
  const [key, setKey] = useState(0);

  const forceUpdate = () => setKey(prevKey => prevKey + 1);


  useEffect(() => {
    function keydownHandler(e) {
      if (e.key == "k") {
        // random is necessary to trigger a state change
        if (thirdPerson) setCameraPosition([-6, 3.9, 6.21 + Math.random() * 0.01]);
        setThirdPerson(!thirdPerson);
      } else if (e.key == "r") {
        setThirdPerson(false);
        forceUpdate();
      }
    }

    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  }, [thirdPerson]);

  return (
    <Suspense fallback={null} key={key}>
      <Environment
        files={process.env.PUBLIC_URL + "/textures/envmap.hdr"}
        background={"both"}
      />

      <PerspectiveCamera makeDefault position={cameraPosition} fov={40} />
        {!thirdPerson && (
          <>
            <OrbitControls target={[-2.64, -0.71, 0.03]} />
            <Player setThirdPerson={setThirdPerson} />
          </>
        )}
        {/* <Suspense fallback={null}>
        <ThirdPersonCharacter />
      </Suspense> */}

        <Ground />
        <Track />
        <Car thirdPerson={thirdPerson} />
    </Suspense>
  );
}
