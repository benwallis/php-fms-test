<?php
class Template
{
    public $debug = false;

    public $file = array(); // $file[varname] = "filename";

    public $root = ''; // relative filenames are relative to this pathname

    public $varkeys = array(); // $varkeys[key] = "key"
    public $varvals = array(); // $varvals[key] = "value"

    public $unknowns = 'remove';
    /*
       "remove"  => remove undefined variables
       "comment" => replace undefined variables with comments
       "keep"    => keep undefined variables
    */

    public $halt_on_error = 'report';
    /*
       "yes"    => halt
       "report" => report error, continue
       "no"     => ignore error quietly
    */

    public $last_error = '';

    // public $varname_pattern = ''; // ^\s\t\r\n}

    /***********************************************************************************************************
     * New Template
     *
     * @param $root string Document root of templates
     * @param $unknowns string How to handle unkown variables
     *
     */
    public function Template($root='.', $unknowns='remove')
    {
        $this->set_root($root);
        $this->set_unknowns($unknowns);
    }

    /***********************************************************************************************************
     * Set docroot of template directory
     *
     * @param $root string Docroot of templates
     *
     * @return boolean
     *
     */
    private function set_root($root)
    {
        if ( ! is_dir($root))
        {
            $this->halt("set_root: {$root} is not a directory");

            return false;
        }

        $this->root = $root;

        return true;
    }


  /***************************************************************************/
  /* public: set_unknowns(enum $unknowns)
   * unknowns: "remove", "comment", "keep"
   */
  private function set_unknowns($unknowns='remove')
  {
      $this->unknowns = $unknowns;
  }


  /***************************************************************************/
  /* public: set_file(array $filelist)
   * filelist: array of varname, filename pairs.
   *
   * public: set_file(string $varname, string $filename)
   * varname: varname for a filename,
   * filename: name of template file
   */
  public function set_file($varname, $filename='')
  {
      if ( ! is_array($varname))
      {
          if (empty($filename))
          {
              $this->halt("set_file: For varname {$varname}, filename is empty.");

              return false;
          }

          $this->file[$varname] = $this->filename($filename);

          if (defined('DTV_DEBUG') && DTV_DEBUG === true && isset($_SESSION['debug']['templates'])) $_SESSION['debug']['templates'][] = $filename;
      }
      else
      {
          foreach ($varname as $k => $filename)
          {
              if (empty($filename))
              {
                  $this->halt("set_file: For varname {$filename}, filename is empty.");

                  return false;
              }

              $this->file[$k] = $this->filename($filename);

              if (defined('DTV_DEBUG') && DTV_DEBUG === true && isset($_SESSION['debug']['templates'])) $_SESSION['debug']['templates'][] = $filename;
          }
      }

      return true;
  }


  /***************************************************************************/
  /* public: set_block(string $parent, string $varname, string $name = "")
   * extract the template $varname from $parent,
   * place variable {$name} instead.
   */
  public function set_block($parent, $varname, $name='')
  {
      if ( ! $this->loadfile($parent))
      {
          $this->halt("set_block: unable to load {$parent}.");

          return false;
      }

      if (empty($name)) $name = $varname;

      $str = $this->get_var($parent);

      $reg = "/<!--\s+BEGIN {$varname}\s+-->(.*)\s*<!--\s+END {$varname}\s+-->/sm";

      preg_match_all($reg, $str, $m);

      $str = preg_replace($reg, '{{'.$name.'}}', $str);

      if (isset($m[1][0])) $this->set_var($varname, $m[1][0]);

      $this->set_var($parent, $str);

      // START Owen debug hack
      if ($this->debug && empty($m[1][0])) echo $parent.'<br />'.$varname;
      // END Owen debug hack

      return true;
  }


  /***************************************************************************/
  /* public: set_var(array $values)
   * values: array of variable name, value pairs.
   *
   * public: set_var(string $varname, string $value)
   * varname: name of a variable that is to be defined
   * value:   value of that variable
   */
  public function set_var($varname, $value='')
  {
      if ( ! is_array($varname))
      {
          if ( ! empty($varname))
          {
              if ($this->debug) echo "<p>Scalar: set <strong>{$varname}</strong> to:\n<br />\n".htmlspecialchars($value)."\n<hr />\n";

              // This does not seem necessary:
              //$value = preg_replace(array('/\$([0-9])/', '/\\\\([0-9])/'), array('&#36;\1', '&#92;\1'), $value);

              // $this->varkeys[$varname] = '/'.$this->varname($varname).'/';

              $this->varkeys[$varname] = $this->varname($varname);

              $this->varvals[$varname] = $value;
          }
      }
      else
      {
          foreach ($varname as $k => $v)
          {
              if ( ! empty($k))
              {
                  if ($this->debug) echo "<p>Array: set <strong>{$k}</strong> to:\n<br />\n{$v}\n<hr />\n";

                  //$v = preg_replace(array('/\$([0-9])/', '/\\\\([0-9])/'), array('&#36;\1', '&#92;\1'), $v);

                  // $this->varkeys[$k] = '/'.$this->varname($k).'/';

                  $this->varkeys[$k] = $this->varname($k);

                  $this->varvals[$k] = $v;
              }
          }
      }

      return;
  }


  /***************************************************************************/
  /* public: subst(string $varname)
   * varname: varname of template where variables are to be substituted.
   */
  private function subst($varname)
  {
      if ( ! $this->loadfile($varname))
      {
          $this->halt("subst: unable to load {$varname}.");

          return false;
      }

      $str = $this->get_var($varname);

      // $str = preg_replace($this->varkeys, $this->varvals, $str);

      $str = str_replace($this->varkeys, $this->varvals, $str);

      return $str;
  }


  /***************************************************************************/
  /* public: psubst(string $varname)
   * varname: varname of template where variables are to be substituted.
   */
  private function psubst($varname)
  {
      echo $this->subst($varname);

      return false;
  }


  /***************************************************************************/
  /* public: parse(string $target, string $varname, boolean append)
   * public: parse(string $target, array  $varname, boolean append)
   * target: varname of variable to generate
   * varname: varname of template to substitute
   * append: append to target varname
   */
  public function parse($target, $varname, $append=false)
  {
      if ( ! is_array($varname))
      {
          $str = $this->subst($varname);

          if ($append) $str = $this->get_var($target).$str;

          $this->set_var($target, $str);
      }
      else
      {
          foreach ($varname as $v)
          {
              $str = $this->subst($v);

              $this->set_var($target, $str);
          }
      }

      return $str;
  }


  /***************************************************************************/
  public function pparse($target, $varname, $append=false)
  {
      echo $this->finish($this->parse($target, $varname, $append));

      return false;
  }


  /***************************************************************************/
  /* public: get_vars()
   * return all variables as an array (mostly for debugging)
   */
  public function get_vars()
  {
      $result = array();

      foreach ($this->varkeys as $k => $v)   $result[$k] = $this->get_var($k);

      return $result;
  }


  /***************************************************************************/
  /* public: get_var(string varname)
   * varname: name of variable.
   *
   * public: get_var(array varname)
   * varname: array of variable names
   */
  public function get_var($varname)
  {
      if ( ! is_array($varname))
      {
          return (isset($this->varvals[$varname])) ? $this->varvals[$varname] : '' ;
      }
      else
      {
          $result = array();

          foreach ($varname as $v)
          {
              $result[$v] = (isset($this->varvals[$v])) ? $this->varvals[$v] : '' ;
          }

          return $result;
      }
  }


  /***************************************************************************/
  /* public: get_undefined($varname)
   * varname: varname of a template.
   */
  public function get_undefined($varname)
  {
      if ( ! $this->loadfile($varname))
      {
          $this->halt("get_undefined: unable to load {$varname}.");

          return false;
      }

      //preg_match_all('/{{([^\s\t\r\n}]+)}}/', $this->get_var($varname), $m);

      preg_match_all('/{{([A-Z_0-9]+)}}/', $this->get_var($varname), $m);

      $m = $m[1];

      if ( ! is_array($m)) return false;

      foreach ($m as $v)
      {
          if ( ! isset($this->varkeys[$v]))     $result[$v] = $v;
      }

      return (count($result)) ? $result : false ;
  }


  /***************************************************************************/
  /* public: finish(string $str)
   * str: string to finish.
   */
  private function finish($str)
  {
      switch ($this->unknowns)
      {
          case 'keep':
          break;

          case "remove":
          //$str = preg_replace('/{{[^\s\t\r\n}]+}}/', '', $str);
          $str = preg_replace('/{{[A-Z_0-9]+}}/', "", $str);
          break;

          case 'comment':
          //$str = preg_replace('/{{([^\s\t\r\n}]+)}}/', "<!-- Template variable \\1 undefined -->", $str);
          $str = preg_replace('/{{([A-Z_0-9]+)}}/', "<!-- Template variable \\1 undefined -->", $str);

          break;
      }

      // This does not seem necessary:
      //$str = preg_replace(array('/&#36;([0-9])/', '/&#92;([0-9])/'), array('$\1', '\\\1'), $str);

      return $str;
  }


  /***************************************************************************/
  /* public: p(string $varname)
   * varname: name of variable to print.
   */
  public function p($varname)
  {
      echo $this->finish($this->get_var($varname));
  }


  /***************************************************************************/
  public function get($varname)
  {
      return $this->finish($this->get_var($varname));
  }


  /***************************************************************************/
  /* private: filename($filename)
   * filename: name to be completed.
   */
  private function filename($filename)
  {
      if (substr($filename, 0, 1) != '/')   $filename = $this->root.'/'.$filename;

      if ( ! is_file($filename))    $this->halt("filename: {$filename} does not exist or is not a file.");

      return $filename;
  }


  /***************************************************************************/
  /* private: varname($varname)
   * varname: name of a replacement variable to be protected.
   */
  private function varname($varname)
  {
      // I don't think preg_quote() is needed
      //return preg_quote('{{'.$varname.'}}');

      return '{{'.$varname.'}}';
  }


  /***************************************************************************/
  /* private: loadfile(string $varname)
   * varname:  load file defined by varname, if it is not loaded yet.
   */
  private function loadfile($varname)
  {
      if ( ! isset($this->file[$varname]))
      {
          // $varname does not reference a file so return
          return true;
      }

      if (isset($this->varvals[$varname]))
      {
          // will only be unset if varname was created with set_file and has never been loaded
          // $varname has already been loaded so return
          return true;
      }

      $filename = $this->file[$varname];

      //echo $filename;
      //exit;

      // $str = implode("", @file($filename));

      $str = file_get_contents($filename);

      if ( ! $str || empty($str))
      {
          $this->halt("loadfile: While loading {$varname}, {$filename} does not exist or is empty.");

          return false;
      }

      $this->set_var($varname, $str);

      return true;
  }


  /***************************************************************************/
  /* public: halt(string $msg)
   * msg:    error message to show.
   */
  public function halt($msg)
  {
      $this->last_error = $msg;

      if ($this->halt_on_error != 'no') $this->haltmsg($msg);

      if ($this->halt_on_error == 'yes') die('<b>Halted.</b>');

      return false;
  }


  /***************************************************************************/
  /* public, override: haltmsg($msg)
   * msg: error message to show.
   */
  public function haltmsg($msg)
  {
      echo "<strong>Template Error:</strong> {$msg}<br />\n";
  }
}
?>