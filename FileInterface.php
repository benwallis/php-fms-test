<?php

interface FileInterface
{
  /**
   * @return string
   */
  public function getName();

  /**
   * @param string $name
   *
   * @return $this
   */
  public function setName($name);

  /**
   * @return int
   */
  public function getSize();

  /**
   * @param int $size
   *
   * @return $this
   */
  public function setSize($size);


  /**
   * @return string
   */
  public function getPath();
}
