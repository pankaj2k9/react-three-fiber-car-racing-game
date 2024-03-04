
import { OrbitControls, useAnimations, useGLTF } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useInput } from './useInput'
import * as THREE from "three"

let walkDirection = new THREE.Vector3();
let rotateAngle = new THREE.Vector3(0, 1, 0); // Used for quaternion rotation
let rotateQuarternion = new THREE.Quaternion();
let cameraTarget = new THREE.Vector3();

const directionOffset = ({ forward, backward, left, right }) => {
  let directionOffset = 0; // Default to 0 (forward)

  if (forward) {
    directionOffset = 0; // forward
    if (left) directionOffset += Math.PI / 4; // forward left
    else if (right) directionOffset -= Math.PI / 4; // forward right
  } else if (backward) {
    directionOffset = Math.PI; // backward
    if (left) directionOffset += Math.PI / 4; // backward left
    else if (right) directionOffset -= Math.PI / 4; // backward right
  } else if (left) {
    directionOffset = Math.PI / 2; // left
  } else if (right) {
    directionOffset = -Math.PI / 2; // right
  }

  return directionOffset;
}

function Player({ setThirdPerson }) {
  const { forward, backward, right, left, jump, shift } = useInput();
  const model = useGLTF("./models/player.glb");
  const { actions } = useAnimations(model.animations, model.scene);
  const currentAction = useRef("");
  const controlsRef = useRef();
  const { camera } = useThree();

  const updateCameraTarget = (moveX, moveZ) => {
    camera.position.x += moveX;
    camera.position.z += moveZ;
    cameraTarget.copy(model.scene.position).add(new THREE.Vector3(0, 2, 0));
    if (controlsRef.current) controlsRef.current.target.copy(cameraTarget);
  }

  useEffect(() => {
    let action = "idle"; // Default to "idle"

    // Determine the action based on input
    if (forward || backward || left || right) {
      action = shift ? "running" : "walking";
    } else if (jump) {
      action = "jump";
    }

    console.log("action", action);

    // Check if the current action has changed
    if (currentAction.current !== action) {
      // Stop the current action if it exists
      if (currentAction.current && actions[currentAction.current]) {
        actions[currentAction.current].stop();
      }

      // Play the new action if it exists
      if (actions[action]) {
        actions[action].reset().play();
        currentAction.current = action;
      }
    }
  }, [actions, forward, backward, right, left, jump, shift]);


  useFrame((state, delta) => {
    if (currentAction.current === "running" || currentAction.current === "walking") {
      let angleYCameraDirection = Math.atan2(
        camera.position.x - model.scene.position.x,
        camera.position.z - model.scene.position.z
      ) + Math.PI; // Added Math.PI to reverse direction

      let newDirectionOffset = directionOffset({ forward, backward, left, right });

      rotateQuarternion.setFromAxisAngle(
        rotateAngle,
        angleYCameraDirection + newDirectionOffset
      );
      model.scene.quaternion.slerp(rotateQuarternion, 0.2); // Use slerp for smoother rotation

      camera.getWorldDirection(walkDirection);
      walkDirection.y = 0;
      walkDirection.normalize();
      walkDirection.applyAxisAngle(rotateAngle, newDirectionOffset + Math.PI); // Added Math.PI to correct direction

      const velocity = currentAction.current === "running" ? 1 : 0.5;
      const moveX = walkDirection.x * velocity * delta;
      const moveZ = walkDirection.z * velocity * delta;

      if (Math.abs(model.scene.position.x - 0) < 1.6) {
        setThirdPerson(true);
      }

      model.scene.position.x -= moveX;
      model.scene.position.z -= moveZ;
    }
  });




  return (
    <>
      <OrbitControls ref={controlsRef} />
      <primitive object={model.scene} rotation-y={Math.PI} scale={0.05} position={[-2.8, 0, 3.8]} />
    </>
  )
}

export default Player